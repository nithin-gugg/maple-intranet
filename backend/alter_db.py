import asyncio
from app.core.database import engine
from app.models.learning import Base

async def init_models():
    async with engine.begin() as conn:
        # Create all new tables defined in models that do not exist yet
        await conn.run_sync(Base.metadata.create_all)
        print("Database tables updated successfully!")

if __name__ == "__main__":
    asyncio.run(init_models())
