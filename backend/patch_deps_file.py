import os

file_path = "app/api/deps.py"
with open(file_path, "r") as f:
    content = f.read()

# First revert the previous patch if any
content = content.replace("token = credentials.credentials\n    print(f'RECEIVED TOKEN: {token}')", "token = credentials.credentials")
content = content.replace("payload = jwt.decode(token, settings.AUTH_SECRET, algorithms=[\"HS256\"])\n        print(f'DECODED PAYLOAD: {payload}')", "payload = jwt.decode(token, settings.AUTH_SECRET, algorithms=[\"HS256\"])")
content = content.replace("except JWTError as e:\n        print(f'JWT ERROR: {e}')", "except JWTError:")

# Apply new patch
content = content.replace(
    "token = credentials.credentials",
    "token = credentials.credentials\n    with open('debug_token.log', 'a') as f: f.write(f'RECEIVED TOKEN: {token}\\n')"
)

content = content.replace(
    "payload = jwt.decode(token, settings.AUTH_SECRET, algorithms=[\"HS256\"])",
    "payload = jwt.decode(token, settings.AUTH_SECRET, algorithms=[\"HS256\"])\n        with open('debug_token.log', 'a') as f: f.write(f'DECODED PAYLOAD: {payload}\\n')"
)

content = content.replace(
    "except JWTError:",
    "except JWTError as e:\n        with open('debug_token.log', 'a') as f: f.write(f'JWT ERROR: {e}\\n')"
)

with open(file_path, "w") as f:
    f.write(content)
