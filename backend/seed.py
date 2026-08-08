import asyncio
from app.core.database import async_session, engine, Base
from app.models.user import User, UserRole
from app.core.security import hash_password

async def seed():
    # create tables if they don't exist
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        
    async with async_session() as session:
        from sqlalchemy import select, delete
        
        # Remove legacy test@example.com user if present
        await session.execute(delete(User).where(User.email == "test@example.com"))
        await session.commit()

        users_to_seed = [
            {
                "email": "admin",
                "full_name": "System Admin",
                "password": "admin123",
                "role": UserRole.ADMIN,
                "phone": "+1234567890"
            },
            {
                "email": "admin@example.com",
                "full_name": "System Admin",
                "password": "admin123",
                "role": UserRole.ADMIN,
                "phone": "+1234567890"
            },
            {
                "email": "user",
                "full_name": "Campus User",
                "password": "user123",
                "role": UserRole.USER,
                "phone": "+1987654321"
            },
            {
                "email": "user@example.com",
                "full_name": "Campus User",
                "password": "user123",
                "role": UserRole.USER,
                "phone": "+1987654321"
            }
        ]
        
        for user_data in users_to_seed:
            result = await session.execute(select(User).where(User.email == user_data["email"]))
            existing_user = result.scalars().first()
            if not existing_user:
                print(f"Creating user {user_data['email']}...")
                new_user = User(
                    email=user_data["email"],
                    full_name=user_data["full_name"],
                    hashed_password=hash_password(user_data["password"]),
                    role=user_data["role"],
                    is_active=True,
                    is_verified=True,
                    phone=user_data["phone"]
                )
                session.add(new_user)
            else:
                existing_user.hashed_password = hash_password(user_data["password"])
                existing_user.role = user_data["role"]
                existing_user.is_active = True
                existing_user.is_verified = True
        
        await session.commit()
        print("Admin and User credentials seeded successfully!")

        # Seed initial fleet robots if empty
        from app.models.robot import Robot, RobotStatus
        robots_result = await session.execute(select(Robot))
        if not robots_result.scalars().first():
            print("Seeding initial fleet robots...")
            robots_to_seed = [
                Robot(name="DSR-Alpha 01", serial_number="DSR-SN-001", status=RobotStatus.IDLE, battery_level=95.0, location_lat=23.0906, location_lng=72.5344, payload_capacity_kg=15.0, firmware_version="2.4.1", model_type="Heavy Payload Bot"),
                Robot(name="DSR-Beta 02", serial_number="DSR-SN-002", status=RobotStatus.IDLE, battery_level=88.0, location_lat=23.0912, location_lng=72.5351, payload_capacity_kg=10.0, firmware_version="2.4.1", model_type="Express Runner"),
                Robot(name="DSR-Gamma 03", serial_number="DSR-SN-003", status=RobotStatus.CHARGING, battery_level=42.0, location_lat=180.0, location_lng=80.0, payload_capacity_kg=12.0, firmware_version="2.4.1", model_type="Standard Bot"),
            ]
            session.add_all(robots_to_seed)
            await session.commit()
            print("Initial fleet robots seeded successfully!")

if __name__ == "__main__":
    asyncio.run(seed())
