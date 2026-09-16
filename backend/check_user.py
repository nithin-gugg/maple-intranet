import asyncio
from sqlalchemy import select
from app.core.database import AsyncSessionLocal
from app.models.core import User
async def run():
    db = AsyncSessionLocal()
    result = await db.execute(select(User).where(User.email=='nithin@maplelearningsolutions.com'))
    user = result.scalars().first()
    print('Active:', user.is_active, 'Hash:', user.password_hash)
    await db.close()
asyncio.run(run())
