import re
import glob

def update_file(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if "courseId?: number;" not in content:
        # Add courseId? to props interface
        content = re.sub(r'(interface ScormPlayerProps \{)', r'\1\n  courseId?: number;', content)
        content = re.sub(r'(interface XApiPlayerProps \{)', r'\1\n  courseId?: number;', content)
        content = re.sub(r'(interface Cmi5PlayerProps \{)', r'\1\n  courseId?: number;', content)
        
        # Add courseId to component arguments
        content = re.sub(r'(export default function \w+\(\{ )(packageId)', r'\1courseId, \2', content)
        
        # Add courseId to fetch body
        content = re.sub(r'(body: JSON\.stringify\(\{ package_id: packageId,)( user_id: userId \}\))', r'\1 course_id: courseId,\2', content)
        content = re.sub(r'(body: JSON\.stringify\(\{ \n?\s*package_id: packageId,\n?\s*)(user_id: userId)', r'\1course_id: courseId,\n            \2', content)

        # Write back
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filename}")
    else:
        print(f"Already updated {filename}")

files = [
    "components/scorm/Scorm12Player.tsx",
    "components/scorm/Scorm2004Player.tsx",
    "components/scorm/XApiPlayer.tsx",
    "components/scorm/Cmi5Player.tsx"
]

for f in files:
    update_file(f)
