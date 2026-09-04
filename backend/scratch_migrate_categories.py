import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

async def main():
    DATABASE_URL = "postgresql+asyncpg://postgres.iidmjrsfflnpbijiijpo:Maplelearningsolutions@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"
    engine = create_async_engine(DATABASE_URL)

    async with engine.begin() as conn:
        print("Checking if main_category column exists...")
        result = await conn.execute(text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='document_categories' AND column_name='main_category';
        """))
        if not result.fetchone():
            print("Adding main_category column...")
            await conn.execute(text("ALTER TABLE document_categories ADD COLUMN main_category VARCHAR(50) DEFAULT 'OFFICIAL'"))
        else:
            print("Column main_category already exists.")

        print("Migrating existing category...")
        # Get existing categories to see if there's anything to migrate
        await conn.execute(text("""
            UPDATE document_categories 
            SET name = 'UNCATEGORIZED_OFFICIAL', main_category = 'OFFICIAL'
            WHERE id = 1 AND name = 'Official Policies';
        """))

        # Seed new categories
        categories = [
            ("ONBOARDING", "OFFICIAL", "Onboarding Documents"),
            ("TEAMS_DEPARTMENTS", "OFFICIAL", "Teams & Departments"),
            ("ANNOUNCEMENTS_UPDATES", "OFFICIAL", "Announcements & Updates"),
            ("SOPS", "OPERATIONAL", "SOPs"),
            ("WORKFLOWS", "OPERATIONAL", "Workflows")
        ]

        print("Seeding new categories...")
        for name, main_cat, desc in categories:
            # Check if exists
            res = await conn.execute(text("SELECT id FROM document_categories WHERE name = :name"), {"name": name})
            if not res.fetchone():
                await conn.execute(text("""
                    INSERT INTO document_categories (name, description, main_category, is_system)
                    VALUES (:name, :desc, :main_cat, true)
                """), {"name": name, "desc": desc, "main_cat": main_cat})
        
        print("Migration complete!")

if __name__ == "__main__":
    asyncio.run(main())
