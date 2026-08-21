import os

frontend_dir = r"c:\Users\Maple Edge\Downloads\nitin workspace\Maple_Intranet\frontend"
count = 0

for root, dirs, files in os.walk(frontend_dir):
    if "node_modules" in dirs:
        dirs.remove("node_modules")
    if ".next" in dirs:
        dirs.remove(".next")
        
    for file in files:
        if file.endswith((".ts", ".tsx")):
            filepath = os.path.join(root, file)
            try:
                with open(filepath, "r", encoding="utf-8") as f:
                    content = f.read()
                
                # Replace ${process.env.NEXT_PUBLIC_API_URL} with ${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}
                # Avoid double replacing if it's already there
                if "${process.env.NEXT_PUBLIC_API_URL}" in content and "${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}" not in content:
                    new_content = content.replace("${process.env.NEXT_PUBLIC_API_URL}", "${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}")
                    with open(filepath, "w", encoding="utf-8") as f:
                        f.write(new_content)
                    count += 1
            except Exception as e:
                print(f"Error reading {filepath}: {e}")

print(f"Replaced in {count} files.")
