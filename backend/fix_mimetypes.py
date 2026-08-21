import asyncio
from sqlalchemy.future import select
from app.core.database import AsyncSessionLocal
from app.models.learning import LearningPackage
from app.learning.services.storage import SupabaseStorageService
from pathlib import Path

async def fix_mimetypes_hard():
    print("Hard fixing mimetypes for migrated packages by replacing them...")
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
                    print(f"Force re-uploading package {pkg.id} to fix mimetypes...")
                    
                    # Instead of relying on upsert, list all files in the bucket for this path and remove them
                    # Or just delete the whole folder? supabase-py requires deleting individual files.
                    # It's easier to just use update() on supabase-py
                    
                    for root, _, files in local_dir.walk() if hasattr(local_dir, 'walk') else __import__('os').walk(local_dir):
                        root_path = Path(root)
                        for file_name in files:
                            file_path = root_path / file_name
                            relative_path = file_path.relative_to(local_dir)
                            storage_path = f"{pkg.storage_path}/{relative_path}".replace("\\", "/")
                            
                            # Get explicit mimetype
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
                                try:
                                    storage_service.client.storage.from_(storage_service.bucket_name).remove([storage_path])
                                except Exception as e:
                                    pass # Ignore if it doesn't exist
                                
                                try:
                                    storage_service.client.storage.from_(storage_service.bucket_name).upload(
                                        path=storage_path,
                                        file=f,
                                        file_options=file_options
                                    )
                                except Exception as e:
                                    print(f"Failed to upload {storage_path}: {e}")
                    print(f"[OK] Package {pkg.id} hard fixed.")
                else:
                    print(f"[WARN] Local directory {local_dir} missing for package {pkg.id}, cannot fix.")
            except Exception as e:
                print(f"[FAIL] Error fixing package {pkg.id}: {e}")

if __name__ == "__main__":
    asyncio.run(fix_mimetypes_hard())
