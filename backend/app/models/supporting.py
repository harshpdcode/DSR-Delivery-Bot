"""
DSR Delivery Bot â€” Telemetry, RobotHealth, OTPLog, Notification, DeliveryHistory, AuditLog Models
Supporting models for the delivery platform.
"""

from datetime import datetime, timezone

from sqlalchemy import (
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    Boolean,
    JSON,
)
from sqlalchemy.orm import relationship

from app.core.database import Base


class Telemetry(Base):
    """Real-time robot telemetry data points."""

    __tablename__ = "telemetry"

    id = Column(Integer, primary_key=True, autoincrement=True)
    robot_id = Column(Integer, ForeignKey("robots.id"), nullable=False, index=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    speed = Column(Float, default=0.0)
    heading = Column(Float, default=0.0)
    battery_level = Column(Float, nullable=False)
    temperature = Column(Float, nullable=True)
    signal_strength = Column(Float, nullable=True)
    timestamp = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
        index=True,
    )

    robot = relationship("Robot", back_populates="telemetry")


class RobotHealth(Base):
    """Sensor and component health records for a robot."""

    __tablename__ = "robot_health"

    id = Column(Integer, primary_key=True, autoincrement=True)
    robot_id = Column(Integer, ForeignKey("robots.id"), nullable=False, index=True)
    sensor_name = Column(String(100), nullable=False)
    status = Column(String(50), default="healthy", nullable=False)
    value = Column(Float, nullable=True)
    unit = Column(String(30), nullable=True)
    message = Column(Text, nullable=True)
    recorded_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    robot = relationship("Robot", back_populates="health_records")


class OTPLog(Base):
    """OTP generation and verification log."""

    __tablename__ = "otp_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    delivery_id = Column(
        Integer, ForeignKey("deliveries.id"), nullable=False, index=True
    )
    otp_hash = Column(String(64), nullable=False)
    attempts = Column(Integer, default=0, nullable=False)
    max_attempts = Column(Integer, default=3, nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    verified_at = Column(DateTime(timezone=True), nullable=True)
    sent_via = Column(String(20), default="sms", nullable=False)  # sms / app
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    delivery = relationship("Delivery", back_populates="otp_logs")


class Notification(Base):
    """User notifications â€” push, SMS, or in-app."""

    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    body = Column(Text, nullable=False)
    type = Column(String(50), default="info", nullable=False)
    read = Column(Boolean, default=False, nullable=False)
    metadata = Column(JSON, nullable=True)
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    user = relationship("User", back_populates="notifications")


class DeliveryHistory(Base):
    """Delivery status change log â€” full audit trail."""

    __tablename__ = "delivery_history"

    id = Column(Integer, primary_key=True, autoincrement=True)
    delivery_id = Column(
        Integer, ForeignKey("deliveries.id"), nullable=False, index=True
    )
    status = Column(String(50), nullable=False)
    note = Column(Text, nullable=True)
    changed_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    timestamp = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    delivery = relationship("Delivery", back_populates="history")


class AuditLog(Base):
    """System-wide audit log for security compliance."""

    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action = Column(String(100), nullable=False)
    resource = Column(String(100), nullable=False)
    resource_id = Column(Integer, nullable=True)
    metadata = Column(JSON, nullable=True)
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(Text, nullable=True)
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
        index=True,
    )

    user = relationship("User", back_populates="audit_logs")
