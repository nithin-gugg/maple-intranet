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
        
        # We need to wrap http://localhost:8000/api... in backticks and ${process.env...}
        # ONLY if it's not already in quotes or backticks.
        # But my previous bad regex literally left `http://localhost:8000/api...` directly in the code!
        
        content = re.sub(
            r'(?<![\`\"\'])http://localhost:8000(/[\w/\-\?]*)',
            r'`${process.env.NEXT_PUBLIC_API_URL || \'http://localhost:8000\'}\1`',
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
