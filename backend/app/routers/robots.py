"""
DSR Delivery Bot â€” Robots Router
Fleet management: list, detail, status update, health, telemetry.
"""

from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user, require_role
from app.models.robot import Robot, RobotStatus
from app.models.supporting import RobotHealth, Telemetry
from app.models.user import User, UserRole
from app.schemas.schemas import (
    RobotHealthResponse,
    RobotResponse,
    RobotStatusUpdate,
    TelemetryResponse,
)

router = APIRouter(prefix="/robots", tags=["Robots"])


@router.get("", response_model=List[RobotResponse])
async def list_robots(
    status_filter: str = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all robots, optionally filtered by status."""
    query = select(Robot).where(Robot.deleted_at.is_(None))
    if status_filter:
        try:
            rs = RobotStatus(status_filter)
            query = query.where(Robot.status == rs)
        except ValueError:
            pass
    query = query.order_by(Robot.name)
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/{robot_id}", response_model=RobotResponse)
async def get_robot(
    robot_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a single robot's details."""
    result = await db.execute(
        select(Robot).where(Robot.id == robot_id, Robot.deleted_at.is_(None))
    )
    robot = result.scalar_one_or_none()
    if not robot:
        raise HTTPException(status_code=404, detail="Robot not found")
    return robot


@router.put("/{robot_id}/status", response_model=RobotResponse)
async def update_robot_status(
    robot_id: int,
    body: RobotStatusUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_role(UserRole.ADMIN, UserRole.OPERATOR, UserRole.MAINTENANCE)
    ),
):
    """Update a robot's status (admin/operator/maintenance only)."""
    result = await db.execute(select(Robot).where(Robot.id == robot_id))
    robot = result.scalar_one_or_none()
    if not robot:
        raise HTTPException(status_code=404, detail="Robot not found")

    try:
        robot.status = RobotStatus(body.status)
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid status: {body.status}")

    if body.battery_level is not None:
        robot.battery_level = body.battery_level
    if body.location_lat is not None:
        robot.location_lat = body.location_lat
    if body.location_lng is not None:
        robot.location_lng = body.location_lng
    if body.error_message is not None:
        robot.error_message = body.error_message

    await db.flush()
    await db.refresh(robot)
    return robot


@router.get("/{robot_id}/health", response_model=List[RobotHealthResponse])
async def get_robot_health(
    robot_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get sensor health records for a robot."""
    result = await db.execute(
        select(RobotHealth)
        .where(RobotHealth.robot_id == robot_id)
        .order_by(RobotHealth.recorded_at.desc())
        .limit(50)
    )
    return result.scalars().all()


@router.get("/{robot_id}/telemetry", response_model=List[TelemetryResponse])
async def get_robot_telemetry(
    robot_id: int,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get recent telemetry data for a robot."""
    result = await db.execute(
        select(Telemetry)
        .where(Telemetry.robot_id == robot_id)
        .order_by(Telemetry.timestamp.desc())
        .limit(min(limit, 500))
    )
    return result.scalars().all()
