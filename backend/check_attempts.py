import asyncio
from sqlalchemy import select
from app.core.database import AsyncSessionLocal
from app.models.learning import Course, LearningAttempt, LearningPackage

async def main():
    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(LearningAttempt.id, LearningAttempt.course_id, LearningAttempt.package_id)
        )
        attempts = result.all()
        print(f"Total attempts in DB: {len(attempts)}")
        for a in attempts:
            print(f"Attempt ID {a.id} -> Course ID: {a.course_id}, Package ID: {a.package_id}")

if __name__ == "__main__":
    asyncio.run(main())
