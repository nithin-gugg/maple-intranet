import os
import glob
import re

files = glob.glob('**/*.tsx', recursive=True) + glob.glob('**/*.ts', recursive=True)
count = 0
for f in files:
    if 'node_modules' in f or '.next' in f: continue
    try:
        with open(f, 'r', encoding='utf-8') as file:
            content = file.read()
            
        old_content = content
        
        # Replace `|| http://localhost:8000;` with `|| 'http://localhost:8000';`
        content = re.sub(
            r'\|\|\s*http://localhost:8000;',
            r"|| 'http://localhost:8000';",
            content
        )
        
        if content != old_content:
            with open(f, 'w', encoding='utf-8') as file:
                file.write(content)
            count += 1
            print(f'Fixed {f}')
    except Exception as e:
        pass

print(f'Fixed {count} files.')
