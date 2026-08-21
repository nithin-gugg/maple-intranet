import os
import httpx
from dotenv import load_dotenv

load_dotenv()

supabase_url = os.getenv('SUPABASE_URL')
supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

bucket = "scorm"
file_path = "scorm/097a0a60-a780-4628-be62-25d50381cd60/v1/scormdriver/indexAPI.html"
url = f"{supabase_url}/storage/v1/object/{bucket}"

headers = {
    "Authorization": f"Bearer {supabase_key}",
    "apikey": supabase_key,
    "Content-Type": "application/json"
}

# The remove endpoint expects a list of prefixes
payload = {"prefixes": [file_path]}

print(f"Removing {file_path} from {url}...")
resp = httpx.request("DELETE", url, headers=headers, json=payload)
print(resp.status_code)
print(resp.text)
