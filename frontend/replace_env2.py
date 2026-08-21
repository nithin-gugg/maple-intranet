import os
import glob

files = glob.glob('**/*.tsx', recursive=True) + glob.glob('**/*.ts', recursive=True)
count = 0
for f in files:
    try:
        with open(f, 'r', encoding='utf-8') as file:
            content = file.read()
        
        if '${process.env.NEXT_PUBLIC_API_URL}' in content:
            new_content = content.replace("${process.env.NEXT_PUBLIC_API_URL}", "${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}")
            with open(f, 'w', encoding='utf-8') as file:
                file.write(new_content)
            count += 1
    except Exception as e:
        print(f"Error processing {f}: {e}")

print(f"Replaced in {count} files.")
