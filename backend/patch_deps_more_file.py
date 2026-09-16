import os

file_path = "app/api/deps.py"
with open(file_path, "r") as f:
    content = f.read()

# Replace prints with file writes
content = content.replace(
    "print(f'GET_CURRENT_USER: {user_id} -> {user}')",
    "with open('debug_token.log', 'a') as f: f.write(f'GET_CURRENT_USER: {user_id} -> {user}\\n')"
)

content = content.replace(
    "print(f'REQUIRE_ADMIN: {user.id} -> {user.role}')",
    "with open('debug_token.log', 'a') as f: f.write(f'REQUIRE_ADMIN: {user.id} -> {user.role}\\n')"
)

with open(file_path, "w") as f:
    f.write(content)
