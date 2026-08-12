"""
DSR Go Ã¢â‚¬â€ Robots Router
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
    status_filter: str | None = None,
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
    robots = result.scalars().all()

    if not robots:
        # Auto-seed initial fleet robots if DB is empty
        robots_to_seed = [
            Robot(name="DSR-Alpha 01", serial_number="DSR-SN-001", status=RobotStatus.IDLE, battery_level=95.0, location_lat=120.0, location_lng=320.0, payload_capacity_kg=15.0, firmware_version="2.4.1", model_type="Heavy Payload Bot"),
            Robot(name="DSR-Beta 02", serial_number="DSR-SN-002", status=RobotStatus.IDLE, battery_level=88.0, location_lat=260.0, location_lng=150.0, payload_capacity_kg=10.0, firmware_version="2.4.1", model_type="Express Runner"),
            Robot(name="DSR-Gamma 03", serial_number="DSR-SN-003", status=RobotStatus.CHARGING, battery_level=42.0, location_lat=180.0, location_lng=80.0, payload_capacity_kg=12.0, firmware_version="2.4.1", model_type="Standard Bot"),
        ]
        db.add_all(robots_to_seed)
        await db.commit()
        result = await db.execute(query)
        robots = result.scalars().all()

    return robots


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


from app.models.delivery import CampusBlock
from app.schemas.schemas import (
    MessageResponse,
    RobotCompartmentRequest,
    RobotDispatchRequest,
    RobotHealthResponse,
    RobotResponse,
    RobotStatusUpdate,
    TelemetryResponse,
)


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


@router.post("/{robot_id}/compartment", response_model=MessageResponse)
async def control_robot_compartment(
    robot_id: int,
    body: RobotCompartmentRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_role(UserRole.ADMIN, UserRole.OPERATOR)
    ),
):
    """Force open or close a robot compartment door (Admin/Operator only)."""
    result = await db.execute(select(Robot).where(Robot.id == robot_id))
    robot = result.scalar_one_or_none()
    if not robot:
        raise HTTPException(status_code=404, detail="Robot not found")

    action_lower = body.action.lower()
    if action_lower not in ("open", "close"):
        raise HTTPException(status_code=400, detail="Action must be 'open' or 'close'")

    # In hardware integration, this sends command over MQTT/WebSocket to ESP32 / ROS2
    return MessageResponse(
        message=f"Compartment for Robot '{robot.name}' successfully set to {action_lower.upper()}"
    )


@router.post("/{robot_id}/dispatch", response_model=RobotResponse)
async def manual_dispatch_robot(
    robot_id: int,
    body: RobotDispatchRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_role(UserRole.ADMIN, UserRole.OPERATOR)
    ),
):
    """Manually dispatch a robot to a specific campus block (Admin/Operator only)."""
    result = await db.execute(select(Robot).where(Robot.id == robot_id))
    robot = result.scalar_one_or_none()
    if not robot:
        raise HTTPException(status_code=404, detail="Robot not found")

    try:
        target_block = CampusBlock(body.destination_block)
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid campus block: {body.destination_block}")

    robot.status = RobotStatus.EN_ROUTE
    robot.error_message = None
    await db.flush()
    await db.refresh(robot)
    return robot


@router.post("/{robot_id}/toggle-status", response_model=RobotResponse)
async def toggle_robot_status(
    robot_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_role(UserRole.ADMIN, UserRole.OPERATOR)
    ),
):
    """Toggle a robot between ACTIVE (IDLE) and INACTIVE (OFFLINE) states (Admin/Operator only)."""
    result = await db.execute(
        select(Robot).where(Robot.id == robot_id, Robot.deleted_at.is_(None))
    )
    robot = result.scalar_one_or_none()
    if not robot:
        raise HTTPException(status_code=404, detail="Robot not found")

    # Only allow toggling if robot is not actively in use
    non_toggleable = {RobotStatus.EN_ROUTE, RobotStatus.DELIVERING, RobotStatus.RETURNING}
    if robot.status in non_toggleable:
        raise HTTPException(
            status_code=409,
            detail=f"Cannot toggle robot status while it is '{robot.status.value}'. Wait until delivery completes."
        )

    # Toggle: IDLE/CHARGING/ERROR -> OFFLINE, OFFLINE/MAINTENANCE -> IDLE
    if robot.status == RobotStatus.OFFLINE:
        robot.status = RobotStatus.IDLE
        robot.error_message = None
    else:
        robot.status = RobotStatus.OFFLINE

    await db.flush()
    await db.refresh(robot)
    return robot


@router.post("/{robot_id}/make-available", response_model=RobotResponse)
async def make_robot_available(
    robot_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_role(UserRole.ADMIN, UserRole.OPERATOR)
    ),
):
    """Force-reset a robot to IDLE / available state (Admin/Operator only).

    Intended for testing and unblocking robots stuck in a non-idle status.
    Clears any error message and sets battery to 100% to guarantee usability.
    """
    result = await db.execute(
        select(Robot).where(Robot.id == robot_id, Robot.deleted_at.is_(None))
    )
    robot = result.scalar_one_or_none()
    if not robot:
        raise HTTPException(status_code=404, detail="Robot not found")

    robot.status = RobotStatus.IDLE
    robot.error_message = None
    robot.battery_level = 100.0

    await db.flush()
    await db.refresh(robot)
    return robot
