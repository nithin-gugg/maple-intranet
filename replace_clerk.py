import os
import re
import glob

FRONTEND_DIR = r"c:\Users\Maple Edge\Downloads\nitin workspace\Maple_Intranet\frontend"

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # If file does not contain @clerk/nextjs, skip
    if "@clerk/nextjs" not in content and "Clerk" not in content:
        return

    original = content

    # 1. Imports
    content = re.sub(
        r'import\s+{\s*useAuth\s*(?:,\s*useUser\s*)?}\s*from\s*[\'"]@clerk/nextjs[\'"];?',
        'import { useSession } from "next-auth/react";',
        content
    )
    content = re.sub(
        r'import\s+{\s*useAuth\s*}\s*from\s*[\'"]@clerk/nextjs[\'"];?',
        'import { useSession } from "next-auth/react";',
        content
    )
    content = re.sub(
        r'import\s+{\s*useUser\s*}\s*from\s*[\'"]@clerk/nextjs[\'"];?',
        'import { useSession } from "next-auth/react";',
        content
    )
    content = re.sub(
        r'import\s+{\s*auth\s*}\s*from\s*[\'"]@clerk/nextjs/server[\'"];?',
        'import { getServerSession } from "next-auth";\nimport { authOptions } from "@/app/api/auth/[...nextauth]/route";',
        content
    )
    
    # 2. Server Components (auth())
    content = re.sub(
        r'const\s+{\s*userId\s*(?:,\s*getToken)?\s*}\s*=\s*(?:await\s+)?auth\(\);?',
        'const session = await getServerSession(authOptions);\n  const userId = session?.user?.id;\n  const token = session?.accessToken;',
        content
    )
    content = re.sub(
        r'const\s+{\s*userId\s*}\s*=\s*(?:await\s+)?auth\(\);?',
        'const session = await getServerSession(authOptions);\n  const userId = session?.user?.id;',
        content
    )
    content = re.sub(
        r'const\s+{\s*getToken\s*}\s*=\s*(?:await\s+)?auth\(\);?',
        'const session = await getServerSession(authOptions);\n  const token = session?.accessToken;',
        content
    )

    # 3. Client Components (useAuth())
    content = re.sub(
        r'const\s+{\s*getToken\s*(?:,\s*userId)?\s*}\s*=\s*useAuth\(\);?',
        'const { data: session } = useSession();\n  const token = session?.accessToken;\n  const userId = session?.user?.id;',
        content
    )
    content = re.sub(
        r'const\s+{\s*userId\s*(?:,\s*getToken)?\s*}\s*=\s*useAuth\(\);?',
        'const { data: session } = useSession();\n  const userId = session?.user?.id;\n  const token = session?.accessToken;',
        content
    )
    content = re.sub(
        r'const\s+{\s*getToken\s*}\s*=\s*useAuth\(\);?',
        'const { data: session } = useSession();\n  const token = session?.accessToken;',
        content
    )
    content = re.sub(
        r'const\s+{\s*userId\s*}\s*=\s*useAuth\(\);?',
        'const { data: session } = useSession();\n  const userId = session?.user?.id;',
        content
    )

    # 4. Client Components (useUser())
    content = re.sub(
        r'const\s+{\s*user\s*(?:,\s*isLoaded)?\s*}\s*=\s*useUser\(\);?',
        'const { data: session, status } = useSession();\n  const user = session?.user;\n  const isLoaded = status !== "loading";',
        content
    )
    content = re.sub(
        r'const\s+{\s*isLoaded\s*,\s*user\s*}\s*=\s*useUser\(\);?',
        'const { data: session, status } = useSession();\n  const user = session?.user;\n  const isLoaded = status !== "loading";',
        content
    )
    content = re.sub(
        r'const\s+{\s*user\s*}\s*=\s*useUser\(\);?',
        'const { data: session } = useSession();\n  const user = session?.user;',
        content
    )

    # 5. getToken() -> token
    content = re.sub(r'await\s+getToken\(\)', 'token', content)
    content = re.sub(r'await\s+getToken\(\s*{[^}]*}\s*\)', 'token', content)
    
    # 6. <UserButton /> removal or replacement
    if "UserButton" in content:
        content = re.sub(
            r'import\s+{\s*UserButton\s*}\s*from\s*[\'"]@clerk/nextjs[\'"];?',
            '',
            content
        )
        # We will replace <UserButton /> with a custom placeholder or signout button
        content = re.sub(r'<UserButton\s*[^>]*>', '<button onClick={() => require("next-auth/react").signOut()} className="px-3 py-1 bg-red-500 text-white rounded text-sm">Sign Out</button>', content)
        content = re.sub(r'</UserButton>', '', content)
        content = re.sub(r'<UserButton\s*/>', '<button onClick={() => require("next-auth/react").signOut()} className="px-3 py-1 bg-red-500 text-white rounded text-sm">Sign Out</button>', content)

    # 7. <SignIn /> or <SignUp /> - Should already be done manually for the auth pages, but just in case
    # Remove remaining clerk imports if any
    content = re.sub(r'import\s*.*?from\s*[\'"]@clerk/nextjs.*[\'"];?\n', '', content)
    
    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated: {filepath}")

def main():
    for root, dirs, files in os.walk(FRONTEND_DIR):
        if "node_modules" in root or ".next" in root:
            continue
        for file in files:
            if file.endswith(('.ts', '.tsx')):
                process_file(os.path.join(root, file))

if __name__ == "__main__":
    main()
