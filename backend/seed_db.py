import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import AsyncSessionLocal
from app.models.core import User, Department
from app.models.document import DocumentCategory
from app.models.learning import CourseCategory
from sqlalchemy import select

async def seed():
    async with AsyncSessionLocal() as db:
        # Check if user exists
        user_result = await db.execute(select(User).where(User.id == "temp_admin_user"))
        user = user_result.scalars().first()
        if not user:
            user = User(
                id="temp_admin_user", 
                email="admin@maple.com", 
                first_name="Temp", 
                last_name="Admin"
            )
            db.add(user)

        # Check if department exists
        dept_result = await db.execute(select(Department).where(Department.id == 1))
        dept = dept_result.scalars().first()
        if not dept:
            dept = Department(name="Human Resources")
            db.add(dept)
            
        # Check if DocumentCategory exists
        doc_cat_result = await db.execute(select(DocumentCategory).where(DocumentCategory.id == 1))
        doc_cat = doc_cat_result.scalars().first()
        if not doc_cat:
            doc_cat = DocumentCategory(name="Official Policies")
            db.add(doc_cat)
            
        # Check if CourseCategory exists
        course_cat_result = await db.execute(select(CourseCategory).where(CourseCategory.id == 1))
        course_cat = course_cat_result.scalars().first()
        if not course_cat:
            course_cat = CourseCategory(name="Company Onboarding")
            db.add(course_cat)

        await db.commit()
        print("Seed data successfully inserted!")

if __name__ == "__main__":
    asyncio.run(seed())
