"""
DSR Go Ã¢â‚¬â€ User Model
Supports role-based access: admin, operator, security, maintenance, user.
"""

import enum
from datetime import datetime, timezone

from sqlalchemy import (
    Column,
    DateTime,
    Enum,
    Integer,
    String,
    Boolean,
    Text,
)
from sqlalchemy.orm import relationship

from app.core.database import Base


class UserRole(str, enum.Enum):
    ADMIN = "admin"
    OPERATOR = "operator"
    SECURITY = "security"
    MAINTENANCE = "maintenance"
    USER = "user"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    phone = Column(String(20), unique=True, nullable=True, index=True)
    full_name = Column(String(150), nullable=False)
    hashed_password = Column(Text, nullable=False)
    role = Column(Enum(UserRole), default=UserRole.USER, nullable=False)
    firebase_uid = Column(String(128), unique=True, nullable=True)
    avatar_url = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)

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
    deliveries_sent = relationship(
        "Delivery", back_populates="sender", foreign_keys="Delivery.sender_id"
    )
    deliveries_received = relationship(
        "Delivery", back_populates="receiver", foreign_keys="Delivery.receiver_id"
    )
    notifications = relationship("Notification", back_populates="user")
    audit_logs = relationship("AuditLog", back_populates="user")

    def __repr__(self) -> str:
        return f"<User id={self.id} email={self.email} role={self.role}>"
