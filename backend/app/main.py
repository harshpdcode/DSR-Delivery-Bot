"""
DSR Go — FastAPI Application Entry Point
"""

import asyncio
import math
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import ORJSONResponse
from loguru import logger
from sqlalchemy import select

from app.core.config import get_settings
from app.core.database import engine, Base, async_session
from app.core.redis import close_redis
from app.models.delivery import Delivery, DeliveryStatus
from app.models.robot import Robot, RobotStatus
from app.models.supporting import DeliveryHistory
from app.routers import auth, robots, deliveries, otp, analytics, tracking, users
from app.routers.tracking import manager

settings = get_settings()

BLOCK_COORDS = {
    "A Block": (120.0, 320.0),
    "B Block": (260.0, 150.0),
    "C Block": (420.0, 180.0),
    "D Block": (180.0, 80.0),
    "E Block": (480.0, 350.0),
}


async def _run_live_fleet_simulation():
    """Background task to simulate active robot movements along paths & broadcast live telemetry."""
    while True:
        try:
            await asyncio.sleep(2.5)
            async with async_session() as db:
                result = await db.execute(
                    select(Delivery).where(
                        Delivery.status.in_([DeliveryStatus.EN_ROUTE, DeliveryStatus.PICKUP_IN_PROGRESS]),
                        Delivery.deleted_at.is_(None),
                    )
                )
                active_deliveries = result.scalars().all()

                for delivery in active_deliveries:
                    if not delivery.robot_id:
                        continue

                    robot_res = await db.execute(select(Robot).where(Robot.id == delivery.robot_id))
                    robot = robot_res.scalar_one_or_none()
                    if not robot:
                        continue

                    target_name = (
                        delivery.destination_block.value
                        if delivery.status == DeliveryStatus.EN_ROUTE
                        else delivery.origin_block.value
                    )
                    target_x, target_y = BLOCK_COORDS.get(target_name, (260.0, 150.0))

                    curr_x = robot.location_lat if robot.location_lat else 120.0
                    curr_y = robot.location_lng if robot.location_lng else 320.0

                    dx = target_x - curr_x
                    dy = target_y - curr_y
                    dist = math.hypot(dx, dy)

                    if dist > 15.0:
                        step_size = min(25.0, dist)
                        new_x = curr_x + (dx / dist) * step_size
                        new_y = curr_y + (dy / dist) * step_size
                        robot.location_lat = round(new_x, 1)
                        robot.location_lng = round(new_y, 1)
                        robot.speed = 1.4
                        robot.heading = int((math.atan2(dy, dx) * 180 / math.pi) % 360)
                    else:
                        robot.location_lat = target_x
                        robot.location_lng = target_y
                        robot.speed = 0.0

                        if delivery.status == DeliveryStatus.EN_ROUTE:
                            delivery.status = DeliveryStatus.ARRIVED
                            robot.status = RobotStatus.DELIVERING
                            history = DeliveryHistory(
                                delivery_id=delivery.id,
                                status=DeliveryStatus.ARRIVED.value,
                                note="Robot reached destination block",
                                changed_by=1,
                            )
                            db.add(history)

                    await db.flush()

                    await manager.broadcast(
                        delivery.id,
                        {
                            "type": "telemetry",
                            "status": delivery.status.value,
                            "robot": {
                                "id": robot.id,
                                "name": robot.name,
                                "lat": robot.location_lat,
                                "lng": robot.location_lng,
                                "battery": robot.battery_level,
                                "speed": robot.speed,
                                "heading": robot.heading,
                            },
                        },
                    )
        except asyncio.CancelledError:
            break
        except Exception as e:
            logger.debug(f"Simulation tick error: {e}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup/shutdown lifecycle."""
    logger.info("🚀 DSR Go Backend starting...")

    # Create database tables with SQLite fallback for local development
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("✅ Primary Database tables initialized")
    except Exception as e:
        logger.warning(f"⚠️ Primary DB connection unavailable ({e}). Initializing SQLite local fallback...")
        from app.core import database
        database.engine = database.create_db_engine("sqlite+aiosqlite:///./dsr_go.db")
        database.async_session = database.async_sessionmaker(
            database.engine,
            class_=database.AsyncSession,
            expire_on_commit=False,
        )
        async with database.engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("✅ SQLite Local Database fallback ready")

    # Auto-seed initial admin/user data
    try:
        from seed import seed
        await seed()
    except Exception as se:
        logger.debug(f"Auto-seed notification: {se}")

    # Start live telemetry & movement background loop
    movement_task = asyncio.create_task(_run_live_fleet_simulation())

    yield

    # Shutdown
    movement_task.cancel()
    logger.info("🛑 Shutting down...")
    try:
        await close_redis()
    except Exception:
        pass
    try:
        await engine.dispose()
    except Exception:
        pass


# — Application ——————————————————————————————————————————————————————————————
app = FastAPI(
    title=settings.APP_NAME,
    description="Smart Autonomous Campus Delivery Robot Platform — Silver Oak University",
    version=settings.APP_VERSION,
    default_response_class=ORJSONResponse,
    lifespan=lifespan,
)

# — Security & CORS Middleware ————————————————————————————————————————————————
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def security_headers_middleware(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    return response


@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(f"→ {request.method} {request.url.path}")
    response = await call_next(request)
    logger.info(f"← {response.status_code} {request.url.path}")
    return response


# — Routers —————————————————————————————————————————————————──────────────────
app.include_router(auth.router, prefix="/api/v1")
app.include_router(robots.router, prefix="/api/v1")
app.include_router(deliveries.router, prefix="/api/v1")
app.include_router(users.router, prefix="/api/v1")
app.include_router(otp.router, prefix="/api/v1")
app.include_router(analytics.router, prefix="/api/v1")
app.include_router(tracking.router)


# — Health Check —————————————————————————————————————————————————─────────────
@app.get("/health", tags=["System"])
async def health_check():
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.APP_ENV,
    }


@app.get("/", tags=["System"])
async def root():
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "description": "Smart Autonomous Campus Delivery Robot Platform",
        "docs": "/docs",
    }
