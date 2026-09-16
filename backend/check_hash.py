import asyncio
from sqlalchemy import select
from app.core.database import AsyncSessionLocal
from app.models.core import User
async def run():
    db = AsyncSessionLocal()
    result = await db.execute(select(User).where(User.email=='nithin@maplelearningsolutions.com'))
    print(result.scalars().first().password_hash)
    await db.close()
asyncio.run(run())
