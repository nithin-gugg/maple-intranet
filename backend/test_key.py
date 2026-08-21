import urllib.request
import json

url = "https://newsapi.org/v2/everything?q=AI&apiKey=60e15ae5-de9c-4004-ae55-abbd86ab5265"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req) as response:
        print("Success:")
        print(response.read().decode())
except urllib.error.HTTPError as e:
    print(f"HTTPError: {e.code}")
    print(e.read().decode())
