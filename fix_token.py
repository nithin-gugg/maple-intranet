import os

def fix_token_assignment(directory):
    for root, _, files in os.walk(directory):
        for file in files:
            if not file.endswith('.tsx') and not file.endswith('.ts'):
                continue
                
            filepath = os.path.join(root, file)
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    lines = f.readlines()
                    
                new_lines = []
                modified = False
                
                for line in lines:
                    if 'const token = token;' in line:
                        modified = True
                        continue # Skip the line completely
                    new_lines.append(line)
                    
                if modified:
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.writelines(new_lines)
                    print(f"Fixed {filepath}")
            except Exception as e:
                print(f"Error processing {filepath}: {e}")

if __name__ == "__main__":
    fix_token_assignment("c:\\Users\\Maple Edge\\Downloads\\nitin workspace\\Maple_Intranet\\frontend")
