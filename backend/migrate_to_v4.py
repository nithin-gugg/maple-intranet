import asyncio
from sqlalchemy.future import select
from sqlalchemy import update
from app.core.database import AsyncSessionLocal
from app.models.learning import LearningPackage
from pathlib import Path
import httpx
import os
from dotenv import load_dotenv

load_dotenv()
supabase_url = os.getenv('SUPABASE_URL')
supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
bucket = "scorm"

async def migrate_to_v4():
    print("Migrating packages to v4 using RAW HTTP requests to guarantee Content-Type...")
    
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(LearningPackage).where(LearningPackage.storage_provider == 'supabase'))
        packages = result.scalars().all()
        
        for pkg in packages:
            try:
                parts = pkg.storage_path.split('/')
                pkg_id = parts[1]
                
                local_dir = Path(f"static/scorm/{pkg_id}")
                if local_dir.exists():
                    print(f"Uploading package {pkg.id} to v4 folder...")
                    
                    new_storage_path = f"scorm/{pkg_id}/v4"
                    
                    for root, _, files in local_dir.walk() if hasattr(local_dir, 'walk') else __import__('os').walk(local_dir):
                        root_path = Path(root)
                        for file_name in files:
                            file_path = root_path / file_name
                            relative_path = file_path.relative_to(local_dir)
                            # Supabase URL expects bucket/path
                            storage_path = f"{new_storage_path}/{relative_path}".replace("\\", "/")
                            url = f"{supabase_url}/storage/v1/object/{bucket}/{storage_path}"
                            
                            ext = file_path.suffix.lower()
                            explicit_mimetypes = {
                                '.html': 'text/html; charset=utf-8',
                                '.htm': 'text/html; charset=utf-8',
                                '.js': 'application/javascript; charset=utf-8',
                                '.css': 'text/css; charset=utf-8',
                                '.json': 'application/json; charset=utf-8',
                                '.png': 'image/png',
                                '.jpg': 'image/jpeg',
                                '.jpeg': 'image/jpeg',
                                '.gif': 'image/gif',
                                '.svg': 'image/svg+xml',
                                '.xml': 'application/xml',
                            }
                            
                            content_type = explicit_mimetypes.get(ext, 'application/octet-stream')
                            
                            headers = {
                                "Authorization": f"Bearer {supabase_key}",
                                "apikey": supabase_key,
                                "Content-Type": content_type,
                                "cache-control": "public, max-age=31536000, immutable"
                            }
                            
                            with open(file_path, "rb") as f:
                                content = f.read()
                                resp = httpx.post(url, headers=headers, content=content)
                                if resp.status_code not in (200, 201):
                                    print(f"Error uploading {storage_path}: {resp.status_code} {resp.text}")
                    
                    # Update database with new path
                    new_entry_url = pkg.entry_point_url.replace(f"/{pkg_id}/v3/", f"/{pkg_id}/v4/").replace(f"/{pkg_id}/v1/", f"/{pkg_id}/v4/")
                    
                    await db.execute(
                        update(LearningPackage)
                        .where(LearningPackage.id == pkg.id)
                        .values(
                            storage_path=new_storage_path,
                            entry_point_url=new_entry_url
                        )
                    )
                    await db.commit()
                    print(f"[OK] Package {pkg.id} migrated to v4.")
                else:
                    print(f"[WARN] Local directory {local_dir} missing for package {pkg.id}.")
            except Exception as e:
                print(f"[FAIL] Error fixing package {pkg.id}: {e}")

if __name__ == "__main__":
    asyncio.run(migrate_to_v4())
