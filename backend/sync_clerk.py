import asyncio
import httpx
from sqlalchemy import select
from app.core.database import AsyncSessionLocal
from app.models.core import Employee
from app.core.config import settings
import os

async def sync_clerk_metadata():
    # Force reload env if needed
    secret_key = "sk_test_9ctlNrppm6pfqKWAXNlk0zp5aRnPmDR98SG4oLn7pP"
    
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(Employee).where(Employee.onboarding_completed == True))
        employees = result.scalars().all()
        
        async with httpx.AsyncClient() as client:
            for emp in employees:
                print(f"Syncing clerk metadata for user: {emp.id}")
                res = await client.patch(
                    f"https://api.clerk.com/v1/users/{emp.id}/metadata",
                    headers={
                        "Authorization": f"Bearer {secret_key}",
                        "Content-Type": "application/json"
                    },
                    json={"public_metadata": {"onboarding_completed": True}}
                )
                if res.status_code == 200:
                    print(f"Successfully synced {emp.id}")
                else:
                    print(f"Failed to sync {emp.id}: {res.text}")

if __name__ == "__main__":
    asyncio.run(sync_clerk_metadata())
