import asyncio
from sqlalchemy import text
from app.core.database import engine

async def alter_db():
    async with engine.begin() as conn:
        print("Altering learning_attempts...")
        await conn.execute(text("ALTER TABLE learning_attempts ALTER COLUMN package_id DROP NOT NULL;"))
        await conn.execute(text("ALTER TABLE learning_attempts ALTER COLUMN standard DROP NOT NULL;"))
        
        print("Altering course_enrollments...")
        await conn.execute(text("ALTER TABLE course_enrollments ADD COLUMN IF NOT EXISTS assigned_by VARCHAR(255);"))
        await conn.execute(text("ALTER TABLE course_enrollments ADD COLUMN IF NOT EXISTS due_date TIMESTAMP WITH TIME ZONE;"))
        await conn.execute(text("ALTER TABLE course_enrollments ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;"))
        
        print("Altering lesson_progress and quiz_attempts...")
        await conn.execute(text("ALTER TABLE lesson_progress ADD COLUMN IF NOT EXISTS attempt_id INTEGER REFERENCES learning_attempts(id) ON DELETE CASCADE;"))
        await conn.execute(text("ALTER TABLE quiz_attempts ADD COLUMN IF NOT EXISTS attempt_id INTEGER REFERENCES learning_attempts(id) ON DELETE CASCADE;"))
        
        # It looks like learning_activity_events also accidentally got attempt_id in the model.
        # Let's add it to the DB as well just to be safe, since it's in the model now.
        await conn.execute(text("ALTER TABLE learning_activity_events ADD COLUMN IF NOT EXISTS attempt_id INTEGER REFERENCES learning_attempts(id) ON DELETE CASCADE;"))
        
        print("Database schema successfully altered!")

if __name__ == "__main__":
    asyncio.run(alter_db())
