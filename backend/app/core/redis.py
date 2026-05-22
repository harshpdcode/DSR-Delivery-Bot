"""
DSR Delivery Bot â€” Redis Client
Async Redis connection for caching and pub/sub.
"""

from typing import Optional

import redis.asyncio as aioredis

from app.core.config import get_settings

settings = get_settings()

# â”€â”€ Redis Client â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
_redis_client: Optional[aioredis.Redis] = None


async def get_redis() -> aioredis.Redis:
    """Get or create the Redis client singleton."""
    global _redis_client
    if _redis_client is None:
        _redis_client = aioredis.from_url(
            settings.REDIS_URL,
            encoding="utf-8",
            decode_responses=True,
            max_connections=20,
        )
    return _redis_client


async def close_redis() -> None:
    """Close the Redis connection."""
    global _redis_client
    if _redis_client is not None:
        await _redis_client.close()
        _redis_client = None


# â”€â”€ Cache Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async def cache_set(key: str, value: str, expire: int = 300) -> None:
    """Set a cache key with expiration (default: 5 min)."""
    client = await get_redis()
    await client.set(key, value, ex=expire)


async def cache_get(key: str) -> Optional[str]:
    """Get a cached value by key."""
    client = await get_redis()
    return await client.get(key)


async def cache_delete(key: str) -> None:
    """Delete a cached key."""
    client = await get_redis()
    await client.delete(key)
