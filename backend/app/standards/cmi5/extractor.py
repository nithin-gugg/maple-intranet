import os
import zipfile
import shutil
from pathlib import Path
import xml.etree.ElementTree as ET

MAX_UPLOAD_SIZE = 100 * 1024 * 1024

def is_safe_path(base, target):
    base = Path(base).resolve()
    target = (base / target).resolve()
    return base in target.parents

class Cmi5Extractor:
    def __init__(self, upload_dir: str = "static/cmi5"):
        self.upload_dir = Path(upload_dir)
        self.upload_dir.mkdir(parents=True, exist_ok=True)

    def extract(self, zip_filepath: str, package_id: str) -> dict:
        if os.path.getsize(zip_filepath) > MAX_UPLOAD_SIZE:
            raise ValueError("cmi5 package exceeds maximum allowed size.")

        package_dir = self.upload_dir / package_id
        package_dir.mkdir(parents=True, exist_ok=True)

        try:
            with zipfile.ZipFile(zip_filepath, 'r') as zip_ref:
                for member in zip_ref.namelist():
                    if not is_safe_path(package_dir, member):
                        raise ValueError(f"Malicious file path detected in ZIP: {member}")
                zip_ref.extractall(package_dir)

            manifest_path = package_dir / "cmi5.xml"
            launch_file = None
            
            if manifest_path.exists():
                launch_file = self._parse_cmi5_for_launch_file(manifest_path)
            
            if not launch_file:
                if (package_dir / "index.html").exists():
                    launch_file = "index.html"
                else:
                    raise ValueError("Not a valid cmi5 package: Missing cmi5.xml or index.html.")

            return {
                "package_id": package_id,
                "entry_point_url": f"/static/cmi5/{package_id}/{launch_file}",
                "local_path": str(package_dir)
            }
        except Exception as e:
            if package_dir.exists():
                shutil.rmtree(package_dir)
            raise e

    def _parse_cmi5_for_launch_file(self, manifest_path: Path) -> str:
        try:
            tree = ET.parse(manifest_path)
            root = tree.getroot()
            
            # cmi5 AU url is typically under courseStructure -> au -> url
            for au in root.iter():
                if au.tag.endswith('au'):
                    url = au.find('{https://w3id.org/xapi/profiles/cmi5/v1/CourseStructure.xsd}url')
                    if url is not None and url.text:
                        return url.text.strip()
                    url_no_ns = au.find('url')
                    if url_no_ns is not None and url_no_ns.text:
                        return url_no_ns.text.strip()
                        
            return None
        except Exception:
            return None
