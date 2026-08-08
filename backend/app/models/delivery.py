"""
DSR Go Ã¢â‚¬â€ Delivery Model
Tracks a single delivery mission from creation to completion.
"""

import enum
from datetime import datetime, timezone

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    String,
    Text,
    Float,
)
from sqlalchemy.orm import relationship

from app.core.database import Base


class DeliveryStatus(str, enum.Enum):
    PENDING = "pending"
    ROBOT_ASSIGNED = "robot_assigned"
    PICKUP_IN_PROGRESS = "pickup_in_progress"
    EN_ROUTE = "en_route"
    ARRIVED = "arrived"
    WAITING_OTP = "waiting_otp"
    OTP_VERIFIED = "otp_verified"
    COMPARTMENT_OPEN = "compartment_open"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    FAILED = "failed"
    RETURNING = "returning"


class CampusBlock(str, enum.Enum):
    A_BLOCK = "A Block"
    B_BLOCK = "B Block"
    C_BLOCK = "C Block"
    D_BLOCK = "D Block"
    E_BLOCK = "E Block"


class Delivery(Base):
    __tablename__ = "deliveries"

    id = Column(Integer, primary_key=True, autoincrement=True)
    tracking_code = Column(String(20), unique=True, nullable=False, index=True)
    robot_id = Column(Integer, ForeignKey("robots.id"), nullable=True)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    receiver_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    receiver_phone = Column(String(20), nullable=True)
    receiver_name = Column(String(150), nullable=True)

    origin_block = Column(Enum(CampusBlock), nullable=False)
    destination_block = Column(Enum(CampusBlock), nullable=False)
    status = Column(
        Enum(DeliveryStatus), default=DeliveryStatus.PENDING, nullable=False
    )

    otp_hash = Column(String(64), nullable=True)
    otp_attempts = Column(Integer, default=0, nullable=False)
    otp_expires_at = Column(DateTime(timezone=True), nullable=True)

    package_description = Column(Text, nullable=True)
    package_weight_kg = Column(Float, nullable=True)
    priority = Column(String(20), default="normal", nullable=False)
    is_preloaded = Column(Boolean, default=False, nullable=False)

    estimated_arrival = Column(DateTime(timezone=True), nullable=True)
    actual_arrival = Column(DateTime(timezone=True), nullable=True)

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
    completed_at = Column(DateTime(timezone=True), nullable=True)
    deleted_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    robot = relationship("Robot", back_populates="deliveries")
    sender = relationship(
        "User", back_populates="deliveries_sent", foreign_keys=[sender_id]
    )
    receiver = relationship(
        "User", back_populates="deliveries_received", foreign_keys=[receiver_id]
    )
    history = relationship("DeliveryHistory", back_populates="delivery")
    otp_logs = relationship("OTPLog", back_populates="delivery")

    def __repr__(self) -> str:
        return f"<Delivery id={self.id} tracking={self.tracking_code} status={self.status}>"
