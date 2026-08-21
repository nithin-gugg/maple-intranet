import os
import mimetypes
from pathlib import Path
from typing import List, Dict, Any
from app.core.supabase import supabase_client
import logging

logger = logging.getLogger(__name__)

class SupabaseStorageService:
    def __init__(self, bucket_name: str = "scorm"):
        self.bucket_name = bucket_name
        self.client = supabase_client
        self._ensure_bucket_exists()
        
    def _ensure_bucket_exists(self):
        try:
            buckets = self.client.storage.list_buckets()
            if not any(b.name == self.bucket_name for b in buckets):
                self.client.storage.create_bucket(
                    self.bucket_name,
                    options={"public": True}
                )
        except Exception as e:
            logger.error(f"Error checking/creating bucket {self.bucket_name}: {e}")

    def upload_directory(self, local_dir: str, storage_base_path: str) -> None:
        """
        Uploads an entire local directory to Supabase Storage.
        Maintains relative paths.
        """
        local_path = Path(local_dir)
        for root, _, files in os.walk(local_path):
            for file in files:
                file_path = Path(root) / file
                relative_path = file_path.relative_to(local_path)
                storage_path = f"{storage_base_path}/{relative_path}".replace("\\", "/")
                
                # Explicit fallbacks since Windows registry mimetypes can be unreliable
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
                
                content_type = explicit_mimetypes.get(ext)
                if not content_type:
                    content_type, _ = mimetypes.guess_type(str(file_path))
                
                if not content_type:
                    content_type = "application/octet-stream"
                    
                with open(file_path, "rb") as f:
                    file_options = {
                        "content-type": content_type,
                        "cache-control": "public, max-age=31536000, immutable",
                        "upsert": "true"
                    }
                    self.client.storage.from_(self.bucket_name).upload(
                        path=storage_path,
                        file=f,
                        file_options=file_options
                    )

    def get_public_url(self, storage_path: str) -> str:
        res = self.client.storage.from_(self.bucket_name).get_public_url(storage_path)
        return res
