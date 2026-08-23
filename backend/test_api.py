import asyncio
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.core.database import AsyncSessionLocal
from app.models.learning import Course, CourseModule, LearningAttempt

async def test():
    async with AsyncSessionLocal() as db:
        course_id = 14
        user_id = 'user_3Hrwmz08BOOrE5XBraSMqfSQXxp'
        try:
            result = await db.execute(
                select(Course)
                .options(
                    selectinload(Course.category), 
                    selectinload(Course.modules).selectinload(CourseModule.learning_package)
                )
                .where(Course.id == course_id)
            )
            course = result.scalars().first()
            
            c_dict = {
                "id": course.id,
                "title": course.title,
                "description": course.description,
                "category": {"id": course.category.id, "name": course.category.name} if course.category else None,
                "course_type": course.course_type,
                "modules": [
                    {
                        "id": m.id,
                        "title": m.title,
                        "content_type": m.content_type,
                        "learning_package": {
                            "id": m.learning_package.id,
                            "title": m.learning_package.title,
                            "standard": m.learning_package.standard,
                            "entry_point_url": m.learning_package.entry_point_url
                        } if m.learning_package else None
                    } for m in course.modules
                ],
                "progress_percent": 0,
                "status": "not attempted"
            }
            print("c_dict created successfully!")
            print(c_dict)
        except Exception as e:
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test())
