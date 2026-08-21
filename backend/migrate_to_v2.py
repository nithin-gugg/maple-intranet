import asyncio
from sqlalchemy.future import select
from sqlalchemy import update
from app.core.database import AsyncSessionLocal
from app.models.learning import LearningPackage
from app.learning.services.storage import SupabaseStorageService
from pathlib import Path
import httpx

async def migrate_to_v2():
    print("Migrating packages to v2 to bypass Supabase CDN cache...")
    storage_service = SupabaseStorageService()
    
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(LearningPackage).where(LearningPackage.storage_provider == 'supabase'))
        packages = result.scalars().all()
        
        for pkg in packages:
            try:
                parts = pkg.storage_path.split('/')
                pkg_id = parts[1]
                
                local_dir = Path(f"static/scorm/{pkg_id}")
                if local_dir.exists():
                    print(f"Uploading package {pkg.id} to v2 folder...")
                    
                    new_storage_path = f"scorm/{pkg_id}/v2"
                    
                    for root, _, files in local_dir.walk() if hasattr(local_dir, 'walk') else __import__('os').walk(local_dir):
                        root_path = Path(root)
                        for file_name in files:
                            file_path = root_path / file_name
                            relative_path = file_path.relative_to(local_dir)
                            storage_path = f"{new_storage_path}/{relative_path}".replace("\\", "/")
                            
                            ext = file_path.suffix.lower()
                            explicit_mimetypes = {
                                '.html': 'text/html',
                                '.htm': 'text/html',
                                '.js': 'application/javascript',
                                '.css': 'text/css',
                                '.json': 'application/json',
                                '.png': 'image/png',
                                '.jpg': 'image/jpeg',
                                '.jpeg': 'image/jpeg',
                                '.gif': 'image/gif',
                                '.svg': 'image/svg+xml',
                                '.xml': 'application/xml',
                            }
                            
                            content_type = explicit_mimetypes.get(ext, 'application/octet-stream')
                            
                            with open(file_path, "rb") as f:
                                file_options = {
                                    "content-type": content_type,
                                    "cache-control": "public, max-age=31536000, immutable"
                                }
                                storage_service.client.storage.from_(storage_service.bucket_name).upload(
                                    path=storage_path,
                                    file=f,
                                    file_options=file_options
                                )
                    
                    # Update database with new path
                    # also update entry_point_url to point to v2
                    new_entry_url = pkg.entry_point_url.replace(f"/{pkg_id}/v1/", f"/{pkg_id}/v2/")
                    
                    await db.execute(
                        update(LearningPackage)
                        .where(LearningPackage.id == pkg.id)
                        .values(
                            storage_path=new_storage_path,
                            entry_point_url=new_entry_url
                        )
                    )
                    await db.commit()
                    print(f"[OK] Package {pkg.id} migrated to v2.")
                else:
                    print(f"[WARN] Local directory {local_dir} missing for package {pkg.id}.")
            except Exception as e:
                print(f"[FAIL] Error fixing package {pkg.id}: {e}")

if __name__ == "__main__":
    asyncio.run(migrate_to_v2())
