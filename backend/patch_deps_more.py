import os

file_path = "app/api/deps.py"
with open(file_path, "r") as f:
    content = f.read()

# Add logging to get_current_user
if "print('GET_CURRENT_USER" not in content:
    content = content.replace(
        "user = result.scalars().first()",
        "user = result.scalars().first()\n    print(f'GET_CURRENT_USER: {user_id} -> {user}')"
    )

if "print('REQUIRE_ADMIN" not in content:
    content = content.replace(
        "if user.role != \"admin\":",
        "print(f'REQUIRE_ADMIN: {user.id} -> {user.role}')\n    if user.role != \"admin\":"
    )

with open(file_path, "w") as f:
    f.write(content)
