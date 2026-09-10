"""
DSR Go — Admin Management Router
Administrative endpoints for system diagnostics, database management, and maintenance.
"""

import asyncio
from typing import Any, Dict, List
from fastapi import APIRouter, Depends, HTTPException, status
from loguru import logger
from sqlalchemy import inspect, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core import database
from app.core.config import get_settings
from app.core.database import get_db
from app.core.deps import require_role
from app.models.user import User, UserRole
from seed import init_and_seed_db

settings = get_settings()

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/database/status")
async def get_database_status(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.ADMIN)),
) -> Dict[str, Any]:
    """Get read-only database connectivity status and table statistics (Admin only)."""
    try:
        # Verify query execution
        await db.execute(text("SELECT 1"))

        # Inspect table names safely via SQLAlchemy sync connection inspection
        def _inspect_tables(sync_conn):
            inspector = inspect(sync_conn)
            return sorted(inspector.get_table_names())

        async with database.engine.connect() as conn:
            table_names: List[str] = await conn.run_sync(_inspect_tables)

        db_dialect = database.engine.dialect.name

        return {
            "connected": True,
            "dialect": db_dialect,
            "tables_count": len(table_names),
            "tables": table_names,
            "environment": settings.APP_ENV,
        }
    except Exception as e:
        logger.error(f"Database status check error: {e}")
        return {
            "connected": False,
            "dialect": "unknown",
            "tables_count": 0,
            "tables": [],
            "error": "Database connection unavailable",
            "environment": settings.APP_ENV,
        }


_init_lock = asyncio.Lock()


@router.post("/database/initialize")
async def initialize_database(
    current_user: User = Depends(require_role(UserRole.ADMIN)),
) -> Dict[str, Any]:
    """Manually initialize database tables and seed required data without dropping existing records (Admin only)."""
    async with _init_lock:
        try:
            logger.info(f"Admin '{current_user.email}' requested database initialization.")
            result = await asyncio.wait_for(init_and_seed_db(), timeout=60.0)
            logger.info("Admin database initialization completed successfully.")
            return {
                "status": "success",
                "message": "Database initialized successfully.",
                "tables": result.get("tables", []),
                "details": result.get("details", {}),
            }
        except Exception as e:
            logger.error(f"Admin database initialization failed: {type(e).__name__}: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database initialization failed: {str(e)}",
            )
