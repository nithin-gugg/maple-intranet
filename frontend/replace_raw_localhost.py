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
            
        # Match "http://localhost:8000/api..." or 'http://localhost:8000/api...'
        # and replace with `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api...`
        new_content = re.sub(
            r'[\"\']http://localhost:8000(/.*?)?[\"\']', 
            r'`${process.env.NEXT_PUBLIC_API_URL || \'http://localhost:8000\'}\1`', 
            content
        )
        
        if new_content != content:
            with open(f, 'w', encoding='utf-8') as file:
                file.write(new_content)
            count += 1
            print(f'Fixed {f}')
    except Exception as e:
        pass

print(f'Replaced raw localhost strings in {count} files.')
