import asyncio
import httpx
from jose import jwt
from datetime import datetime, timedelta

AUTH_SECRET = "super_secret_temporary_key_for_dev_only_change_in_prod"
USER_ID = "user_3Hrwmz08BOOrE5XBraSMqfSQXxp"

payload = {
    "sub": USER_ID,
    "exp": datetime.utcnow() + timedelta(hours=1)
}
token = jwt.encode(payload, AUTH_SECRET, algorithm="HS256")
headers = {"Authorization": f"Bearer {token}"}
base_url = "http://localhost:8000/api/v1/calendar"

async def run_tests():
    async with httpx.AsyncClient() as client:
        print("Testing List Calendars...")
        res = await client.get(f"{base_url}/google-calendars", headers=headers)
        print(res.status_code, res.text)
        
        print("Testing Free/Busy...")
        now = datetime.utcnow()
        res = await client.post(f"{base_url}/freebusy", headers=headers, json={
            "timeMin": now.isoformat() + "Z",
            "timeMax": (now + timedelta(days=1)).isoformat() + "Z",
        })
        print(res.status_code, res.text)
        
        print("Testing Create Event...")
        res = await client.post(f"{base_url}/google-events", headers=headers, json={
            "title": "Test Event from API",
            "description": "This is a test event",
            "start": now.isoformat() + "Z",
            "end": (now + timedelta(hours=1)).isoformat() + "Z",
            "create_meet": True
        })
        print(res.status_code, res.text)
        if res.status_code == 200:
            event_id = res.json().get("id")
            print(f"Created event ID: {event_id}")
            
            print("Testing Update Event...")
            res = await client.put(f"{base_url}/google-events/{event_id}", headers=headers, json={
                "title": "Test Event from API (Updated)",
                "start": now.isoformat() + "Z",
                "end": (now + timedelta(hours=1)).isoformat() + "Z",
            })
            print(res.status_code, res.text)
            
            print("Testing Delete Event...")
            res = await client.delete(f"{base_url}/google-events/{event_id}", headers=headers)
            print(res.status_code, res.text)

asyncio.run(run_tests())
