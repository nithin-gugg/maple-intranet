import asyncio
from app.core.database import AsyncSessionLocal
from sqlalchemy import select
from app.models.core import User

async def main():
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(User).where(User.id == 'user_3Hrwmz08BOOrE5XBraSMqfSQXxp'))
        user = result.scalars().first()
        if user:
            print(f"User found! ID: {user.id}, Role: {user.role}, Is_active: {user.is_active}")
        else:
            print("User not found.")

if __name__ == "__main__":
    asyncio.run(main())
