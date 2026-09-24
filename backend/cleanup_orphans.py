import asyncio
from sqlalchemy import select, delete
from app.core.database import AsyncSessionLocal
from app.models.learning import Course, LearningAttempt, TrackingEventInbox, LearningActivityEvent

async def main():
    async with AsyncSessionLocal() as db:
        # Find all learning attempts that have a course_id but the course doesn't exist
        result = await db.execute(
            select(LearningAttempt.id)
            .outerjoin(Course, LearningAttempt.course_id == Course.id)
            .where(LearningAttempt.course_id.isnot(None))
            .where(Course.id.is_(None))
        )
        orphaned_ids = result.scalars().all()
        print(f"Found {len(orphaned_ids)} orphaned attempts: {orphaned_ids}")
        
        if orphaned_ids:
            # We can just delete them directly
            await db.execute(delete(LearningAttempt).where(LearningAttempt.id.in_(orphaned_ids)))
            await db.commit()
            print("Orphaned attempts deleted.")
        else:
            print("No orphaned attempts found.")

        # Find orphaned TrackingEventInbox (where attempt_id is set but attempt does not exist)
        inbox_res = await db.execute(
            select(TrackingEventInbox.id)
            .outerjoin(LearningAttempt, TrackingEventInbox.attempt_id == LearningAttempt.id)
            .where(TrackingEventInbox.attempt_id.isnot(None))
            .where(LearningAttempt.id.is_(None))
        )
        orphaned_inbox = inbox_res.scalars().all()
        print(f"Found {len(orphaned_inbox)} orphaned TrackingEventInbox records")
        if orphaned_inbox:
            await db.execute(delete(TrackingEventInbox).where(TrackingEventInbox.id.in_(orphaned_inbox)))
            await db.commit()
            print("Orphaned TrackingEventInbox deleted.")

        # Find orphaned LearningActivityEvent (where attempt_id is set but attempt does not exist)
        activity_res = await db.execute(
            select(LearningActivityEvent.id)
            .outerjoin(LearningAttempt, LearningActivityEvent.attempt_id == LearningAttempt.id)
            .where(LearningActivityEvent.attempt_id.isnot(None))
            .where(LearningAttempt.id.is_(None))
        )
        orphaned_activities = activity_res.scalars().all()
        print(f"Found {len(orphaned_activities)} orphaned LearningActivityEvent records")
        if orphaned_activities:
            await db.execute(delete(LearningActivityEvent).where(LearningActivityEvent.id.in_(orphaned_activities)))
            await db.commit()
            print("Orphaned LearningActivityEvent deleted.")

        # Find orphaned TrackingEventInbox where course_id is set but course doesn't exist
        inbox_course_res = await db.execute(
            select(TrackingEventInbox.id)
            .outerjoin(Course, TrackingEventInbox.course_id == Course.id)
            .where(TrackingEventInbox.course_id.isnot(None))
            .where(Course.id.is_(None))
        )
        orphaned_inbox_course = inbox_course_res.scalars().all()
        print(f"Found {len(orphaned_inbox_course)} orphaned TrackingEventInbox (by course) records")
        if orphaned_inbox_course:
            await db.execute(delete(TrackingEventInbox).where(TrackingEventInbox.id.in_(orphaned_inbox_course)))
            await db.commit()
            print("Orphaned TrackingEventInbox (by course) deleted.")

if __name__ == "__main__":
    asyncio.run(main())
