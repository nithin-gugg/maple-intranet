import asyncio
from sqlalchemy import select, update
from app.core.database import AsyncSessionLocal
from app.models.core import User
from app.core.security import get_password_hash

async def migrate_passwords():
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(User).where(User.password_hash == None))
        users_without_passwords = result.scalars().all()
        
        if not users_without_passwords:
            print("No users found without a password.")
            return

        temp_password = "TemporaryPassword123!"
        hashed_password = get_password_hash(temp_password)

        for user in users_without_passwords:
            print(f"Setting temporary password for {user.email}")
            user.password_hash = hashed_password
            user.email_verified = True # Assume existing Clerk users are verified

        await db.commit()
        print(f"Migrated {len(users_without_passwords)} users with temporary password: {temp_password}")

if __name__ == "__main__":
    asyncio.run(migrate_passwords())
