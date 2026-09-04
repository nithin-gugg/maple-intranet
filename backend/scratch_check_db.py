import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
import sys

async def main():
    # Use the DB URL from .env
    DATABASE_URL = "postgresql+asyncpg://postgres.iidmjrsfflnpbijiijpo:Maplelearningsolutions@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"
    engine = create_async_engine(DATABASE_URL)
    async_session = sessionmaker(engine, class_=AsyncSession)

    async with async_session() as session:
        result = await session.execute(text("SELECT id, name FROM document_categories"))
        categories = result.fetchall()
        print("Categories:", categories)

        doc_result = await session.execute(text("SELECT id, title, category_id FROM documents LIMIT 5"))
        docs = doc_result.fetchall()
        print("Documents:", docs)

if __name__ == "__main__":
    asyncio.run(main())
