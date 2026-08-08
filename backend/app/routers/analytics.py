"""
DSR Go Ã¢â‚¬â€ Analytics Router
Dashboard statistics, delivery trends, robot efficiency, and heatmap data.
"""

from datetime import datetime, timedelta, timezone
from typing import List

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func, case
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.delivery import Delivery, DeliveryStatus
from app.models.robot import Robot, RobotStatus
from app.models.user import User
from app.schemas.schemas import (
    AnalyticsOverview,
    DeliveryTrend,
    RobotEfficiency,
)

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/overview", response_model=AnalyticsOverview)
async def analytics_overview(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get top-level analytics: totals, success rate, avg time."""
    # Total deliveries
    total_result = await db.execute(
        select(func.count(Delivery.id)).where(Delivery.deleted_at.is_(None))
    )
    total_deliveries = total_result.scalar() or 0

    # Active deliveries
    active_statuses = [
        DeliveryStatus.PENDING,
        DeliveryStatus.EN_ROUTE,
        DeliveryStatus.ARRIVED,
        DeliveryStatus.WAITING_OTP,
    ]
    active_result = await db.execute(
        select(func.count(Delivery.id)).where(Delivery.status.in_(active_statuses))
    )
    active_deliveries = active_result.scalar() or 0

    # Completed deliveries
    completed_result = await db.execute(
        select(func.count(Delivery.id)).where(
            Delivery.status == DeliveryStatus.COMPLETED
        )
    )
    completed_deliveries = completed_result.scalar() or 0

    # Robots
    total_robots_result = await db.execute(
        select(func.count(Robot.id)).where(Robot.deleted_at.is_(None))
    )
    total_robots = total_robots_result.scalar() or 0

    active_robot_statuses = [RobotStatus.EN_ROUTE, RobotStatus.DELIVERING]
    active_robots_result = await db.execute(
        select(func.count(Robot.id)).where(Robot.status.in_(active_robot_statuses))
    )
    active_robots = active_robots_result.scalar() or 0

    # Success rate
    success_rate = (
        (completed_deliveries / total_deliveries * 100) if total_deliveries > 0 else 0
    )

    # Average delivery time (for completed deliveries)
    avg_time_result = await db.execute(
        select(
            func.avg(
                func.extract("epoch", Delivery.completed_at)
                - func.extract("epoch", Delivery.created_at)
            )
        ).where(
            Delivery.status == DeliveryStatus.COMPLETED,
            Delivery.completed_at.isnot(None),
        )
    )
    avg_seconds = avg_time_result.scalar() or 0
    avg_delivery_minutes = round(avg_seconds / 60, 1) if avg_seconds else 0

    return AnalyticsOverview(
        total_deliveries=total_deliveries,
        active_deliveries=active_deliveries,
        completed_deliveries=completed_deliveries,
        total_robots=total_robots,
        active_robots=active_robots,
        avg_delivery_time_minutes=avg_delivery_minutes,
        success_rate=round(success_rate, 1),
    )


@router.get("/deliveries", response_model=List[DeliveryTrend])
async def delivery_trends(
    days: int = Query(30, ge=1, le=365),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get daily delivery counts for trend chart."""
    since = datetime.now(timezone.utc) - timedelta(days=days)

    result = await db.execute(
        select(
            func.date(Delivery.created_at).label("date"),
            func.count(Delivery.id).label("count"),
        )
        .where(Delivery.created_at >= since)
        .group_by(func.date(Delivery.created_at))
        .order_by(func.date(Delivery.created_at))
    )

    return [
        DeliveryTrend(date=str(row.date), count=row.count) for row in result.all()
    ]


@router.get("/robots", response_model=List[RobotEfficiency])
async def robot_efficiency(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get efficiency stats for each robot."""
    result = await db.execute(
        select(
            Robot.id,
            Robot.name,
            func.count(Delivery.id).label("total_deliveries"),
        )
        .outerjoin(Delivery, Delivery.robot_id == Robot.id)
        .where(Robot.deleted_at.is_(None))
        .group_by(Robot.id, Robot.name)
        .order_by(func.count(Delivery.id).desc())
    )

    return [
        RobotEfficiency(
            robot_id=row.id,
            robot_name=row.name,
            total_deliveries=row.total_deliveries,
            avg_battery_usage=0,  # Would be computed from telemetry in production
            uptime_hours=0,
        )
        for row in result.all()
    ]


@router.get("/heatmap")
async def delivery_heatmap(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get heatmap data: deliveries per destination block."""
    result = await db.execute(
        select(
            Delivery.destination_block,
            func.count(Delivery.id).label("count"),
        )
        .where(Delivery.deleted_at.is_(None))
        .group_by(Delivery.destination_block)
    )
    return [
        {"block": row.destination_block.value if hasattr(row.destination_block, 'value') else row.destination_block, "count": row.count}
        for row in result.all()
    ]
