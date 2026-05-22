"""
DSR Delivery Bot â€” Deliveries Router
Create deliveries, start missions, track status, view history.
"""

import secrets
import string
from datetime import datetime, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.delivery import CampusBlock, Delivery, DeliveryStatus
from app.models.robot import Robot, RobotStatus
from app.models.supporting import DeliveryHistory
from app.models.user import User
from app.schemas.schemas import (
    CreateDeliveryRequest,
    DeliveryHistoryResponse,
    DeliveryResponse,
    MessageResponse,
)

router = APIRouter(prefix="/deliveries", tags=["Deliveries"])


def _generate_tracking_code() -> str:
    """Generate a unique 12-char alphanumeric tracking code."""
    chars = string.ascii_uppercase + string.digits
    return "DSR-" + "".join(secrets.choice(chars) for _ in range(8))


@router.post("", response_model=DeliveryResponse, status_code=201)
async def create_delivery(
    body: CreateDeliveryRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new delivery mission."""
    # Validate blocks
    try:
        origin = CampusBlock(body.origin_block)
        destination = CampusBlock(body.destination_block)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid campus block")

    if origin == destination:
        raise HTTPException(
            status_code=400, detail="Origin and destination cannot be the same"
        )

    # Validate robot availability
    result = await db.execute(select(Robot).where(Robot.id == body.robot_id))
    robot = result.scalar_one_or_none()
    if not robot:
        raise HTTPException(status_code=404, detail="Robot not found")
    if robot.status not in (RobotStatus.IDLE, RobotStatus.CHARGING):
        raise HTTPException(status_code=409, detail="Robot is not available")
    if robot.battery_level < 20:
        raise HTTPException(status_code=409, detail="Robot battery too low")

    delivery = Delivery(
        tracking_code=_generate_tracking_code(),
        robot_id=robot.id,
        sender_id=current_user.id,
        receiver_phone=body.receiver_phone,
        receiver_name=body.receiver_name,
        origin_block=origin,
        destination_block=destination,
        status=DeliveryStatus.PENDING,
        package_description=body.package_description,
        package_weight_kg=body.package_weight_kg,
        priority=body.priority,
    )
    db.add(delivery)
    await db.flush()

    # Log initial history
    history = DeliveryHistory(
        delivery_id=delivery.id,
        status=DeliveryStatus.PENDING.value,
        note="Delivery created",
        changed_by=current_user.id,
    )
    db.add(history)
    await db.flush()
    await db.refresh(delivery)
    return delivery


@router.get("", response_model=List[DeliveryResponse])
async def list_deliveries(
    status_filter: Optional[str] = None,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List deliveries for the current user (or all for admin)."""
    query = select(Delivery).where(Delivery.deleted_at.is_(None))

    # Non-admin users only see their own deliveries
    if current_user.role.value not in ("admin", "operator"):
        query = query.where(
            (Delivery.sender_id == current_user.id)
            | (Delivery.receiver_id == current_user.id)
        )

    if status_filter:
        try:
            ds = DeliveryStatus(status_filter)
            query = query.where(Delivery.status == ds)
        except ValueError:
            pass

    query = query.order_by(Delivery.created_at.desc())
    query = query.offset((page - 1) * per_page).limit(per_page)

    result = await db.execute(query)
    return result.scalars().all()


@router.get("/{delivery_id}", response_model=DeliveryResponse)
async def get_delivery(
    delivery_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a single delivery by ID."""
    result = await db.execute(
        select(Delivery).where(
            Delivery.id == delivery_id, Delivery.deleted_at.is_(None)
        )
    )
    delivery = result.scalar_one_or_none()
    if not delivery:
        raise HTTPException(status_code=404, detail="Delivery not found")
    return delivery


@router.post("/{delivery_id}/start", response_model=DeliveryResponse)
async def start_delivery(
    delivery_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Start a delivery mission â€” robot begins movement."""
    result = await db.execute(select(Delivery).where(Delivery.id == delivery_id))
    delivery = result.scalar_one_or_none()
    if not delivery:
        raise HTTPException(status_code=404, detail="Delivery not found")

    if delivery.status != DeliveryStatus.PENDING:
        raise HTTPException(status_code=409, detail="Delivery is not in pending state")

    # Update delivery status
    delivery.status = DeliveryStatus.EN_ROUTE

    # Update robot status
    robot_result = await db.execute(
        select(Robot).where(Robot.id == delivery.robot_id)
    )
    robot = robot_result.scalar_one_or_none()
    if robot:
        robot.status = RobotStatus.EN_ROUTE

    # Log history
    history = DeliveryHistory(
        delivery_id=delivery.id,
        status=DeliveryStatus.EN_ROUTE.value,
        note="Delivery started â€” robot en route",
        changed_by=current_user.id,
    )
    db.add(history)

    await db.flush()
    await db.refresh(delivery)
    return delivery


@router.post("/{delivery_id}/complete", response_model=DeliveryResponse)
async def complete_delivery(
    delivery_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Mark a delivery as completed."""
    result = await db.execute(select(Delivery).where(Delivery.id == delivery_id))
    delivery = result.scalar_one_or_none()
    if not delivery:
        raise HTTPException(status_code=404, detail="Delivery not found")

    delivery.status = DeliveryStatus.COMPLETED
    delivery.completed_at = datetime.now(timezone.utc)

    # Robot returns to dock
    robot_result = await db.execute(
        select(Robot).where(Robot.id == delivery.robot_id)
    )
    robot = robot_result.scalar_one_or_none()
    if robot:
        robot.status = RobotStatus.RETURNING

    history = DeliveryHistory(
        delivery_id=delivery.id,
        status=DeliveryStatus.COMPLETED.value,
        note="Delivery completed â€” parcel collected",
        changed_by=current_user.id,
    )
    db.add(history)

    await db.flush()
    await db.refresh(delivery)
    return delivery


@router.get("/{delivery_id}/history", response_model=List[DeliveryHistoryResponse])
async def get_delivery_history(
    delivery_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get status change history for a delivery."""
    result = await db.execute(
        select(DeliveryHistory)
        .where(DeliveryHistory.delivery_id == delivery_id)
        .order_by(DeliveryHistory.timestamp.asc())
    )
    return result.scalars().all()
