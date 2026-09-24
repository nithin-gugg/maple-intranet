import redis.asyncio as redis
from app.core.config import settings

# Parse the REDIS_URL from settings. Upstash rediss:// URLs typically look like:
# rediss://default:password@host:port
redis_client = redis.from_url(
    settings.REDIS_URL,
    decode_responses=True,
    socket_timeout=5,
    socket_connect_timeout=5
)

async def get_redis():
    return redis_client
