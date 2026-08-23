import os
import shutil
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path
from typing import Dict, Any, Tuple
import hashlib
from app.learning.standards.cmi5.parser import Cmi5Parser

class PackageRepository:
    def __init__(self, storage_dir: str = "static/scorm"):
        self.storage_dir = Path(storage_dir)
        self.storage_dir.mkdir(parents=True, exist_ok=True)

    def extract_and_detect(self, zip_path: str) -> Dict[str, Any]:
        """
        Extracts the ZIP file, detects the LMS standard, and returns metadata.
        Returns:
            {
                "package_type": "scorm_1_2" | "scorm_2004" | "xapi" | "cmi5",
                "manifest_path": "imsmanifest.xml",
                "entry_point_url": "index.html",
                "package_hash": "...",
                "title": "..."
            }
        """
        package_hash = self._compute_hash(zip_path)
        extract_path = self.storage_dir / package_hash
        
        if not extract_path.exists():
            with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                zip_ref.extractall(extract_path)

        metadata = self._detect_standard(extract_path)
        metadata["package_hash"] = package_hash
        metadata["local_path"] = str(extract_path)
        
        return metadata

    def _compute_hash(self, file_path: str) -> str:
        sha256 = hashlib.sha256()
        with open(file_path, "rb") as f:
            for block in iter(lambda: f.read(4096), b""):
                sha256.update(block)
        return sha256.hexdigest()

    def _detect_standard(self, extract_path: Path) -> Dict[str, Any]:
        # 1. Check for cmi5
        if (extract_path / "cmi5.xml").exists():
            with open(extract_path / "cmi5.xml", "r", encoding="utf-8") as f:
                cmi5_data = Cmi5Parser.parse_manifest(f.read())
                
            entry_url = "index.html"
            if cmi5_data["aus"] and len(cmi5_data["aus"]) > 0:
                entry_url = cmi5_data["aus"][0].get("url", "index.html")
                
            return {
                "package_type": "cmi5",
                "manifest_path": "cmi5.xml",
                "entry_point_url": entry_url,
                "cmi5_metadata": cmi5_data
            }
            
        # 2. Check for xAPI (tincan.xml)
        if (extract_path / "tincan.xml").exists():
            return {
                "package_type": "xapi",
                "manifest_path": "tincan.xml",
                "entry_point_url": self._parse_tincan_launch(extract_path / "tincan.xml") or "index.html"
            }
            
        # 3. Check for SCORM (imsmanifest.xml)
        manifest_path = extract_path / "imsmanifest.xml"
        if manifest_path.exists():
            try:
                tree = ET.parse(manifest_path)
                root = tree.getroot()
                # Find namespace
                ns = {'imscp': 'http://www.imsproject.org/xsd/imscp_rootv1p1p2'}
                
                # Check for metadata/schemaversion
                schema_version = ""
                for elem in root.iter():
                    if 'schemaversion' in elem.tag.lower():
                        schema_version = elem.text.strip() if elem.text else ""
                        break
                        
                package_type = "scorm_1_2"
                if "2004" in schema_version or "1.3" in schema_version or "CAM 1.3" in schema_version:
                    package_type = "scorm_2004"
                    
                return {
                    "package_type": package_type,
                    "manifest_path": "imsmanifest.xml",
                    "entry_point_url": self._parse_scorm_launch(manifest_path) or "index.html"
                }
            except Exception:
                # Fallback
                return {
                    "package_type": "scorm_1_2",
                    "manifest_path": "imsmanifest.xml",
                    "entry_point_url": "index.html"
                }
                
        # Fallback if no manifest found but has index.html
        if (extract_path / "index.html").exists():
             return {
                "package_type": "scorm_1_2", # Assume SCORM 1.2 MVP
                "manifest_path": "",
                "entry_point_url": "index.html"
            }
            
        raise ValueError("Invalid package: Cannot determine package standard.")

    def _parse_cmi5_launch(self, xml_path: Path) -> str:
        try:
            tree = ET.parse(xml_path)
            for elem in tree.iter():
                if elem.tag.endswith('url'):
                    return elem.text.strip()
        except: pass
        return None

    def _parse_tincan_launch(self, xml_path: Path) -> str:
        try:
            tree = ET.parse(xml_path)
            for elem in tree.iter():
                if elem.tag.endswith('launch'):
                    return elem.text.strip()
        except: pass
        return None

    def _parse_scorm_launch(self, manifest_path: Path) -> str:
        try:
            tree = ET.parse(manifest_path)
            root = tree.getroot()
            
            # 1. Find organizations -> organization (default) -> item
            orgs = None
            for elem in root.iter():
                if elem.tag.endswith('organizations'):
                    orgs = elem
                    break
            
            if orgs is None: return None
            
            # Find first item with identifierref
            first_item_ref = None
            for item in orgs.iter():
                if item.tag.endswith('item') and item.get('identifierref'):
                    first_item_ref = item.get('identifierref')
                    break
                    
            if not first_item_ref: return None
            
            # 2. Find resources -> resource[identifier=first_item_ref] -> href
            for res in root.iter():
                if res.tag.endswith('resource') and res.get('identifier') == first_item_ref:
                    return res.get('href')
                    
        except Exception:
            pass
        return None
