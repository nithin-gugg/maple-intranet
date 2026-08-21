import os
import httpx
from dotenv import load_dotenv
from pathlib import Path

load_dotenv()

supabase_url = os.getenv('SUPABASE_URL')
supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

bucket = "scorm"
file_path = "scorm/097a0a60-a780-4628-be62-25d50381cd60/v1/scormdriver/indexAPI.html"
url = f"{supabase_url}/storage/v1/object/{bucket}/{file_path}"

headers = {
    "Authorization": f"Bearer {supabase_key}",
    "apikey": supabase_key,
    "Content-Type": "text/html",
    "x-upsert": "true",
    "cache-control": "public, max-age=31536000, immutable"
}

with open("static/scorm/097a0a60-a780-4628-be62-25d50381cd60/scormdriver/indexAPI.html", "rb") as f:
    content = f.read()

print(f"Uploading {len(content)} bytes to {url}...")
resp = httpx.post(url, headers=headers, content=content)
print(resp.status_code)
print(resp.text)
