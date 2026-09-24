import asyncio
from sqlalchemy import select, delete
from app.core.database import AsyncSessionLocal
from app.models.learning import LearningAttempt

async def main():
    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(LearningAttempt.id)
            .where(LearningAttempt.course_id.is_(None))
        )
        orphaned_ids = result.scalars().all()
        print(f"Deleting {len(orphaned_ids)} attempts with course_id=None: {orphaned_ids}")
        
        if orphaned_ids:
            await db.execute(delete(LearningAttempt).where(LearningAttempt.id.in_(orphaned_ids)))
            await db.commit()
            print("Deleted.")

if __name__ == "__main__":
    asyncio.run(main())
