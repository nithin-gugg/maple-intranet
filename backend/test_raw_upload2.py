import os
import httpx
from dotenv import load_dotenv

load_dotenv()

supabase_url = os.getenv('SUPABASE_URL')
supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

bucket = "scorm"
file_path = "scorm/097a0a60-a780-4628-be62-25d50381cd60/v1/scormdriver/indexAPI.html"
url = f"{supabase_url}/storage/v1/object/{bucket}/{file_path}"

headers = {
    "Authorization": f"Bearer {supabase_key}",
    "apikey": supabase_key,
    "x-upsert": "true"
}

with open("static/scorm/097a0a60-a780-4628-be62-25d50381cd60/scormdriver/indexAPI.html", "rb") as f:
    content = f.read()

# files parameter for requests: { "file_field": ("filename", content, "content-type") }
# For Supabase, the field name is usually empty or "file" for multipart, but wait, Supabase raw upload doesn't use multipart.
# It uses raw body but reads the `Content-Type` header of the request!
# Let's try raw upload with Content-Type header but using requests to be sure httpx wasn't stripping it.
headers["Content-Type"] = "text/html; charset=utf-8"
headers["cache-control"] = "public, max-age=31536000, immutable"

print(f"Uploading {len(content)} bytes to {url}...")
resp = httpx.post(url, headers=headers, content=content)
print(resp.status_code)
print(resp.text)
