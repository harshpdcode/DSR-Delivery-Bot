"""
DSR Go — User Management Router (Admin)
Manage user accounts, update roles, and enable/disable users.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User, UserRole
from app.schemas.schemas import UserResponse, UserRoleUpdate, UserStatusUpdate, MessageResponse

router = APIRouter(prefix="/users", tags=["User Management"])


def _verify_admin(user: User):
    if user.role.value not in ("admin", "operator"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin permissions required"
        )


@router.get("", response_model=List[UserResponse])
async def list_users(
    search: Optional[str] = None,
    role_filter: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all registered users (Admin only)."""
    _verify_admin(current_user)

    query = select(User)

    if search:
        search_pattern = f"%{search}%"
        query = query.where(
            or_(
                User.full_name.ilike(search_pattern),
                User.email.ilike(search_pattern),
                User.phone.ilike(search_pattern),
            )
        )

    if role_filter:
        try:
            r = UserRole(role_filter)
            query = query.where(User.role == r)
        except ValueError:
            pass

    query = query.order_by(User.created_at.desc())
    result = await db.execute(query)
    return result.scalars().all()


@router.put("/{user_id}/role", response_model=UserResponse)
async def update_user_role(
    user_id: int,
    body: UserRoleUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update a user's role (Admin only)."""
    _verify_admin(current_user)

    result = await db.execute(select(User).where(User.id == user_id))
    target_user = result.scalar_one_or_none()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")

    try:
        new_role = UserRole(body.role)
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid role: {body.role}")

    target_user.role = new_role
    await db.flush()
    await db.refresh(target_user)
    return target_user


@router.put("/{user_id}/status", response_model=UserResponse)
async def update_user_status(
    user_id: int,
    body: UserStatusUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Activate or deactivate a user account (Admin only)."""
    _verify_admin(current_user)

    result = await db.execute(select(User).where(User.id == user_id))
    target_user = result.scalar_one_or_none()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")

    target_user.is_active = body.is_active
    await db.flush()
    await db.refresh(target_user)
    return target_user
