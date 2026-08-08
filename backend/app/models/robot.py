"""
DSR Go Ã¢â‚¬â€ Robot Model
Represents a physical delivery robot in the fleet.
"""

import enum
from datetime import datetime, timezone

from sqlalchemy import (
    Column,
    DateTime,
    Enum,
    Float,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import relationship

from app.core.database import Base


class RobotStatus(str, enum.Enum):
    IDLE = "idle"
    CHARGING = "charging"
    EN_ROUTE = "en_route"
    DELIVERING = "delivering"
    RETURNING = "returning"
    MAINTENANCE = "maintenance"
    OFFLINE = "offline"
    ERROR = "error"


class Robot(Base):
    __tablename__ = "robots"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), unique=True, nullable=False)
    serial_number = Column(String(100), unique=True, nullable=False)
    status = Column(Enum(RobotStatus), default=RobotStatus.IDLE, nullable=False)
    battery_level = Column(Float, default=100.0, nullable=False)
    location_lat = Column(Float, nullable=True)
    location_lng = Column(Float, nullable=True)
    heading = Column(Float, default=0.0, nullable=True)
    speed = Column(Float, default=0.0, nullable=True)
    firmware_version = Column(String(50), default="1.0.0", nullable=False)
    payload_capacity_kg = Column(Float, default=5.0, nullable=False)
    model_type = Column(String(100), default="DSR-MK1", nullable=False)
    last_maintenance = Column(DateTime(timezone=True), nullable=True)
    error_message = Column(Text, nullable=True)

    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    deleted_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    deliveries = relationship("Delivery", back_populates="robot")
    telemetry = relationship("Telemetry", back_populates="robot")
    health_records = relationship("RobotHealth", back_populates="robot")

    def __repr__(self) -> str:
        return f"<Robot id={self.id} name={self.name} status={self.status}>"
