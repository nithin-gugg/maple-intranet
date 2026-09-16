import os

file_path = "app/api/deps.py"
with open(file_path, "r") as f:
    content = f.read()

content = content.replace(
    "token = credentials.credentials",
    "token = credentials.credentials\n    print(f'RECEIVED TOKEN: {token}')"
)

content = content.replace(
    "payload = jwt.decode(token, settings.AUTH_SECRET, algorithms=[\"HS256\"])",
    "payload = jwt.decode(token, settings.AUTH_SECRET, algorithms=[\"HS256\"])\n        print(f'DECODED PAYLOAD: {payload}')"
)

content = content.replace(
    "except JWTError:",
    "except JWTError as e:\n        print(f'JWT ERROR: {e}')"
)

with open(file_path, "w") as f:
    f.write(content)
