import asyncio
from typing import Any, Dict, Optional
from loguru import logger
from sqlalchemy import select, delete, text, inspect
from sqlalchemy.ext.asyncio import AsyncEngine, async_sessionmaker, AsyncSession

from app.core import database
from app.core.database import Base
from app.core.security import hash_password
import app.models  # Ensures all ORM models are registered on Base.metadata
from app.models.user import User, UserRole
from app.models.robot import Robot, RobotStatus


async def create_tables(engine: Optional[AsyncEngine] = None) -> None:
    """Ensure all database tables exist without dropping existing data."""
    target_engine = engine or database.engine

    # Step 1: Create all tables in an isolated transaction so it commits cleanly
    async with target_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Base metadata tables created or verified successfully.")

    # Step 2: Ensure optional delivery columns exist if database was migrated from older versions
    def _get_delivery_columns(sync_conn):
        inspector = inspect(sync_conn)
        if "deliveries" in inspector.get_table_names():
            return {c["name"] for c in inspector.get_columns("deliveries")}
        return set()

    try:
        async with target_engine.connect() as conn:
            existing_cols = await conn.run_sync(_get_delivery_columns)
    except Exception as e:
        logger.warning(f"Could not inspect deliveries table columns: {e}")
        existing_cols = set()

    columns_to_ensure = [
        ("is_preloaded", "BOOLEAN DEFAULT FALSE"),
        ("extra_stops", "TEXT"),
        ("estimated_arrival", "TIMESTAMP WITH TIME ZONE"),
    ]
    missing_cols = [
        (col, col_type) for col, col_type in columns_to_ensure if col not in existing_cols
    ]

    if missing_cols:
        is_postgres = "postgresql" in target_engine.dialect.name
        for col, col_type in missing_cols:
            try:
                async with target_engine.begin() as conn:
                    if is_postgres:
                        await conn.execute(
                            text(f"ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS {col} {col_type};")
                        )
                    else:
                        await conn.execute(
                            text(f"ALTER TABLE deliveries ADD COLUMN {col} {col_type};")
                        )
                logger.info(f"Added legacy column '{col}' to deliveries table.")
            except Exception as err:
                logger.warning(f"Could not add column {col} to deliveries: {err}")


async def seed_data(
    session_factory: Optional[async_sessionmaker[AsyncSession]] = None,
) -> Dict[str, Any]:
    """Idempotently seed initial demo users and fleet robots."""
    target_session = session_factory or database.async_session

    users_created = 0
    users_verified = 0
    robots_created = 0
    robots_verified = 0

    async with target_session() as session:
        users_to_seed = [
            {
                "email": "admin",
                "full_name": "System Admin",
                "password": "admin123",
                "role": UserRole.ADMIN,
                "phone": "+1234567890",
            },
            {
                "email": "admin@example.com",
                "full_name": "System Admin",
                "password": "admin123",
                "role": UserRole.ADMIN,
                "phone": "+1234567891",
            },
            {
                "email": "user",
                "full_name": "Campus User",
                "password": "user123",
                "role": UserRole.USER,
                "phone": "+1987654321",
            },
            {
                "email": "user@example.com",
                "full_name": "Campus User",
                "password": "user123",
                "role": UserRole.USER,
                "phone": "+1987654322",
            },
            {
                "email": "operator@example.com",
                "full_name": "Sarah Jenkins (Fleet Control)",
                "password": "operator123",
                "role": UserRole.OPERATOR,
                "phone": "+1555019200",
            },
            {
                "email": "professor@example.com",
                "full_name": "Dr. Aris Thorne (Faculty)",
                "password": "prof123",
                "role": UserRole.USER,
                "phone": "+1555014300",
            },
            {
                "email": "student@example.com",
                "full_name": "Alex Rivera (Student)",
                "password": "student123",
                "role": UserRole.USER,
                "phone": "+1555018800",
            },
        ]

        for user_data in users_to_seed:
            result = await session.execute(select(User).where(User.email == user_data["email"]))
            existing_user = result.scalars().first()

            phone_result = await session.execute(select(User).where(User.phone == user_data["phone"]))
            existing_phone = phone_result.scalars().first()

            if not existing_user:
                phone_num = user_data["phone"]
                if existing_phone and existing_phone.email != user_data["email"]:
                    phone_num = f"{user_data['phone']}_{user_data['email']}"

                logger.info(f"Creating demo user {user_data['email']} ({user_data['role']})...")
                new_user = User(
                    email=user_data["email"],
                    full_name=user_data["full_name"],
                    hashed_password=hash_password(user_data["password"]),
                    role=user_data["role"],
                    is_active=True,
                    is_verified=True,
                    phone=phone_num,
                )
                session.add(new_user)
                users_created += 1
            else:
                # Existing user is strictly preserved: passwords, roles, and user data are NOT overwritten
                users_verified += 1

        await session.commit()

        # Seed initial fleet robots idempotently by serial_number
        robots_to_seed = [
            {
                "name": "DSR-Alpha 01",
                "serial_number": "DSR-SN-001",
                "status": RobotStatus.IDLE,
                "battery_level": 95.0,
                "location_lat": 23.0906,
                "location_lng": 72.5344,
                "payload_capacity_kg": 15.0,
                "firmware_version": "2.4.1",
                "model_type": "Heavy Payload Bot",
            },
            {
                "name": "DSR-Beta 02",
                "serial_number": "DSR-SN-002",
                "status": RobotStatus.IDLE,
                "battery_level": 88.0,
                "location_lat": 23.0912,
                "location_lng": 72.5351,
                "payload_capacity_kg": 10.0,
                "firmware_version": "2.4.1",
                "model_type": "Express Runner",
            },
            {
                "name": "DSR-Gamma 03",
                "serial_number": "DSR-SN-003",
                "status": RobotStatus.CHARGING,
                "battery_level": 42.0,
                "location_lat": 180.0,
                "location_lng": 80.0,
                "payload_capacity_kg": 12.0,
                "firmware_version": "2.4.1",
                "model_type": "Standard Bot",
            },
        ]

        for bot_data in robots_to_seed:
            bot_res = await session.execute(
                select(Robot).where(Robot.serial_number == bot_data["serial_number"])
            )
            existing_bot = bot_res.scalars().first()
            if not existing_bot:
                logger.info(f"Seeding robot {bot_data['name']} ({bot_data['serial_number']})...")
                new_bot = Robot(**bot_data)
                session.add(new_bot)
                robots_created += 1
            else:
                robots_verified += 1

        await session.commit()

    return {
        "users_created": users_created,
        "users_verified": users_verified,
        "robots_created": robots_created,
        "robots_verified": robots_verified,
    }


async def init_and_seed_db(
    engine: Optional[AsyncEngine] = None,
    session_factory: Optional[async_sessionmaker[AsyncSession]] = None,
) -> Dict[str, Any]:
    """Create all missing tables and run idempotent initial seed."""
    await create_tables(engine=engine)
    details = await seed_data(session_factory=session_factory)
    return {
        "status": "success",
        "tables": sorted(list(Base.metadata.tables.keys())),
        "details": details,
    }


async def seed() -> Dict[str, Any]:
    """CLI and startup compatibility wrapper."""
    res = await init_and_seed_db()
    print("Database tables and seed data verified successfully:", res)
    return res


if __name__ == "__main__":
    asyncio.run(seed())
