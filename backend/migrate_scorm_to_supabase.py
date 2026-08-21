import asyncio
import os
import shutil
from pathlib import Path
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.database import AsyncSessionLocal
from app.models.learning import LearningPackage
from app.learning.services.storage import SupabaseStorageService

async def migrate_scorm_to_supabase():
    print("Starting SCORM Migration...")
    storage_service = SupabaseStorageService()
    
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(LearningPackage))
        packages = result.scalars().all()
        
        if not packages:
            print("No packages need migration.")
            return

        migrated = 0
        failed = 0
        
        for pkg in packages:
            try:
                print(f"Migrating package {pkg.id} - {pkg.title}...")
                
                # Check if it was saved locally
                # Originally entry_point_url was like /static/scorm/pkg_id/indexAPI.html
                # So local path is static/scorm/pkg_id
                
                parts = pkg.entry_point_url.strip("/").split("/")
                if len(parts) >= 3 and parts[0] == "static":
                    # typically /static/scorm/pkg_id/launch_file
                    pkg_id_from_url = parts[2]
                    local_dir = Path(f"static/scorm/{pkg_id_from_url}")
                    
                    if not local_dir.exists():
                        print(f"[FAIL] Package {pkg.id} -> failed: Local directory {local_dir} not found.")
                        failed += 1
                        continue
                        
                    launch_file = "/".join(parts[3:])
                    storage_base_path = f"scorm/{pkg_id_from_url}/v1"
                    
                    # Upload to Supabase
                    storage_service.upload_directory(str(local_dir), storage_base_path)
                    
                    # Update database
                    pkg.storage_provider = "supabase"
                    pkg.storage_bucket = storage_service.bucket_name
                    pkg.storage_path = storage_base_path
                    pkg.storage_version = "v1"
                    pkg.launch_file = launch_file
                    pkg.package_version = 1
                    
                    public_url = storage_service.get_public_url(f"{storage_base_path}/{launch_file}")
                    pkg.entry_point_url = public_url
                    
                    await db.commit()
                    print(f"[OK] Package {pkg.id} -> migrated")
                    migrated += 1
                else:
                    print(f"[FAIL] Package {pkg.id} -> failed validation: Unexpected entry_point_url format {pkg.entry_point_url}")
                    failed += 1
                    
            except Exception as e:
                print(f"[FAIL] Package {pkg.id} -> failed: {str(e)}")
                failed += 1
                
        print("\nMigration complete:")
        print(f"Migrated: {migrated}")
        print(f"Failed: {failed}")

if __name__ == "__main__":
    asyncio.run(migrate_scorm_to_supabase())
