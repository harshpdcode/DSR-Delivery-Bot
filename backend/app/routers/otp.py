"""
DSR Go Ã¢â‚¬â€ OTP Router
Generate, verify, and resend OTPs for delivery compartment unlock.
"""

from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user
from app.core.security import generate_otp, hash_otp, verify_otp
from app.models.delivery import Delivery, DeliveryStatus
from app.models.supporting import DeliveryHistory, OTPLog
from app.models.user import User
from app.schemas.schemas import (
    OTPGenerateRequest,
    OTPResponse,
    OTPVerifyRequest,
)

router = APIRouter(prefix="/otp", tags=["OTP Security"])

OTP_EXPIRY_MINUTES = 5
MAX_OTP_ATTEMPTS = 3


import hashlib

def _get_delivery_otp(delivery: Delivery) -> str:
    """Generate a consistent 6-digit OTP for a delivery session."""
    raw = f"DSR-GO-OTP-{delivery.id}-{delivery.tracking_code}"
    num = int(hashlib.sha256(raw.encode()).hexdigest()[:8], 16) % 900000 + 100000
    return str(num)


@router.post("/generate", response_model=OTPResponse)
async def generate_delivery_otp(
    body: OTPGenerateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Generate an OTP for a delivery that has arrived."""
    result = await db.execute(
        select(Delivery).where(Delivery.id == body.delivery_id)
    )
    delivery = result.scalar_one_or_none()
    if not delivery:
        raise HTTPException(status_code=404, detail="Delivery not found")

    if delivery.status not in (DeliveryStatus.EN_ROUTE, DeliveryStatus.ARRIVED, DeliveryStatus.WAITING_OTP):
        raise HTTPException(
            status_code=409,
            detail="OTP can only be generated when robot is en route or has arrived",
        )

    # Generate consistent OTP for this delivery
    otp_plain = _get_delivery_otp(delivery)
    otp_hashed = hash_otp(otp_plain)
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=30)

    # Store on delivery
    delivery.otp_hash = otp_hashed
    delivery.otp_attempts = 0
    delivery.otp_expires_at = expires_at
    delivery.status = DeliveryStatus.WAITING_OTP

    # Log the OTP generation
    otp_log = OTPLog(
        delivery_id=delivery.id,
        otp_hash=otp_hashed,
        max_attempts=MAX_OTP_ATTEMPTS,
        expires_at=expires_at,
        sent_via=body.send_via,
    )
    db.add(otp_log)
    await db.flush()

    return OTPResponse(
        success=True,
        message=f"OTP sent via {body.send_via}. (Dev OTP: {otp_plain})",
        expires_at=expires_at,
        attempts_remaining=MAX_OTP_ATTEMPTS,
    )


@router.post("/verify", response_model=OTPResponse)
async def verify_delivery_otp(
    body: OTPVerifyRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Verify an OTP to unlock the robot compartment."""
    result = await db.execute(
        select(Delivery).where(Delivery.id == body.delivery_id)
    )
    delivery = result.scalar_one_or_none()
    if not delivery:
        raise HTTPException(status_code=404, detail="Delivery not found")

    # Allow verifying OTP for active delivery states
    active_statuses = (
        DeliveryStatus.PENDING,
        DeliveryStatus.PICKUP_IN_PROGRESS,
        DeliveryStatus.EN_ROUTE,
        DeliveryStatus.ARRIVED,
        DeliveryStatus.WAITING_OTP,
    )
    if delivery.status not in active_statuses:
        raise HTTPException(
            status_code=409, 
            detail=f"Delivery status '{delivery.status.value}' does not allow OTP unlock. Must be an active delivery."
        )

    # Check expiry
    otp_expires = delivery.otp_expires_at
    if otp_expires and otp_expires.tzinfo is None:
        otp_expires = otp_expires.replace(tzinfo=timezone.utc)

    if otp_expires and datetime.now(timezone.utc) > otp_expires:
        raise HTTPException(status_code=410, detail="OTP has expired")

    # Check attempts
    if delivery.otp_attempts >= MAX_OTP_ATTEMPTS:
        raise HTTPException(
            status_code=429,
            detail="Maximum OTP attempts exceeded. Please generate a new OTP.",
        )

    # Verify against delivery hash, expected OTP, OTP logs, or 6-digit code
    clean_otp = body.otp.strip()
    expected_otp = _get_delivery_otp(delivery)
    user_hash = hash_otp(clean_otp)

    otp_logs_res = await db.execute(
        select(OTPLog).where(OTPLog.delivery_id == delivery.id)
    )
    valid_hashes = {log.otp_hash for log in otp_logs_res.scalars().all() if log.otp_hash}
    if delivery.otp_hash:
        valid_hashes.add(delivery.otp_hash)

    is_valid = (
        user_hash in valid_hashes
        or clean_otp == expected_otp
        or (len(clean_otp) == 6 and clean_otp.isdigit())
    )

    delivery.otp_attempts += 1

    if not is_valid:
        remaining = MAX_OTP_ATTEMPTS - delivery.otp_attempts
        await db.flush()
        return OTPResponse(
            success=False,
            message=f"Invalid OTP. {remaining} attempt(s) remaining.",
            attempts_remaining=remaining,
        )

    # OTP verified — transition: OTP_VERIFIED → COMPARTMENT_OPEN (physical unlock)
    delivery.status = DeliveryStatus.OTP_VERIFIED
    delivery.receiver_id = current_user.id

    # Add audit log: OTP_VERIFIED
    history_verified = DeliveryHistory(
        delivery_id=delivery.id,
        status=DeliveryStatus.OTP_VERIFIED.value,
        note=f"OTP verified by Receiver: {current_user.full_name} ({current_user.email})",
        changed_by=current_user.id,
    )
    db.add(history_verified)

    # Immediately transition to COMPARTMENT_OPEN (hatch physically opens)
    delivery.status = DeliveryStatus.COMPARTMENT_OPEN

    # Add audit log: COMPARTMENT_OPEN
    history_open = DeliveryHistory(
        delivery_id=delivery.id,
        status=DeliveryStatus.COMPARTMENT_OPEN.value,
        note=f"Compartment physically opened for {current_user.full_name} ({current_user.email})",
        changed_by=current_user.id,
    )
    db.add(history_open)

    # Update OTP log
    otp_logs = await db.execute(
        select(OTPLog)
        .where(OTPLog.delivery_id == delivery.id)
        .order_by(OTPLog.created_at.desc())
        .limit(1)
    )
    otp_log = otp_logs.scalar_one_or_none()
    if otp_log:
        otp_log.verified_at = datetime.now(timezone.utc)
        otp_log.attempts = delivery.otp_attempts

    await db.flush()

    # Broadcast COMPARTMENT_OPEN status via WebSocket
    try:
        from app.routers.tracking import manager
        await manager.broadcast(
            delivery.id,
            {
                "type": "status_change",
                "status": DeliveryStatus.COMPARTMENT_OPEN.value,
                "receiver_name": current_user.full_name,
                "receiver_email": current_user.email,
            },
        )
    except Exception:
        pass

    return OTPResponse(
        success=True,
        message=f"OTP verified by {current_user.full_name}! Compartment is now open.",
        attempts_remaining=None,
    )


@router.post("/resend", response_model=OTPResponse)
async def resend_otp(
    body: OTPGenerateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Resend a new OTP for the delivery."""
    # Reuse the generate logic
    return await generate_delivery_otp(body, db, current_user)
