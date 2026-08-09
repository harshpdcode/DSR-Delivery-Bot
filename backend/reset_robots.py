import asyncio
from app.core.database import async_session
from app.models.robot import Robot, RobotStatus
from sqlalchemy import select

async def reset_robots():
    async with async_session() as session:
        result = await session.execute(select(Robot))
        robots = result.scalars().all()
        if not robots:
            print("No robots found. Adding default test robots...")
            session.add_all([
                Robot(name="DSR-Alpha 01", serial_number="DSR-SN-001", status=RobotStatus.IDLE, battery_level=95.0, location_lat=23.0906, location_lng=72.5344, payload_capacity_kg=15.0, firmware_version="2.4.1", model_type="Heavy Payload Bot"),
                Robot(name="DSR-Beta 02", serial_number="DSR-SN-002", status=RobotStatus.IDLE, battery_level=88.0, location_lat=23.0912, location_lng=72.5351, payload_capacity_kg=10.0, firmware_version="2.4.1", model_type="Express Runner"),
                Robot(name="DSR-Gamma 03", serial_number="DSR-SN-003", status=RobotStatus.IDLE, battery_level=75.0, location_lat=23.0918, location_lng=72.5346, payload_capacity_kg=12.0, firmware_version="2.4.1", model_type="Standard Bot"),
            ])
        else:
            print(f"Found {len(robots)} robots. Resetting all to IDLE...")
            for r in robots:
                r.status = RobotStatus.IDLE
                r.battery_level = max(r.battery_level, 80.0)
        await session.commit()
        print("All robots successfully set to IDLE!")

if __name__ == "__main__":
    asyncio.run(reset_robots())
