"""
DSR Delivery Bot â€” OTP Router
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
from app.models.supporting import OTPLog
from app.models.user import User
from app.schemas.schemas import (
    OTPGenerateRequest,
    OTPResponse,
    OTPVerifyRequest,
)

router = APIRouter(prefix="/otp", tags=["OTP Security"])

OTP_EXPIRY_MINUTES = 5
MAX_OTP_ATTEMPTS = 3


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

    if delivery.status not in (DeliveryStatus.ARRIVED, DeliveryStatus.WAITING_OTP):
        raise HTTPException(
            status_code=409,
            detail="OTP can only be generated when robot has arrived",
        )

    # Generate OTP
    otp_plain = generate_otp(6)
    otp_hashed = hash_otp(otp_plain)
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=OTP_EXPIRY_MINUTES)

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

    # In production, this would send SMS via Twilio or push via Firebase
    # For dev, we return the OTP directly
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

    if delivery.status != DeliveryStatus.WAITING_OTP:
        raise HTTPException(status_code=409, detail="Not waiting for OTP")

    # Check expiry
    if delivery.otp_expires_at and datetime.now(timezone.utc) > delivery.otp_expires_at:
        raise HTTPException(status_code=410, detail="OTP has expired")

    # Check attempts
    if delivery.otp_attempts >= MAX_OTP_ATTEMPTS:
        raise HTTPException(
            status_code=429,
            detail="Maximum OTP attempts exceeded. Please generate a new OTP.",
        )

    # Verify
    delivery.otp_attempts += 1

    if not verify_otp(body.otp, delivery.otp_hash):
        remaining = MAX_OTP_ATTEMPTS - delivery.otp_attempts
        await db.flush()
        return OTPResponse(
            success=False,
            message=f"Invalid OTP. {remaining} attempt(s) remaining.",
            attempts_remaining=remaining,
        )

    # OTP verified â€” unlock compartment
    delivery.status = DeliveryStatus.OTP_VERIFIED

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
    return OTPResponse(
        success=True,
        message="OTP verified! Compartment unlocked.",
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
