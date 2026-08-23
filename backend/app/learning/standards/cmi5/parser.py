import xml.etree.ElementTree as ET
from typing import Dict, Any, List, Optional
import os

class Cmi5Parser:
    """
    Parses cmi5.xml to extract the course structure, AUs, and launch parameters.
    """
    
    @staticmethod
    def parse_manifest(xml_content: str) -> Dict[str, Any]:
        """
        Parses the cmi5.xml content and returns a dictionary with course and AU metadata.
        """
        # Strip namespaces for easier parsing
        import re
        xml_content = re.sub(r' xmlns="[^"]+"', '', xml_content, count=1)
        root = ET.fromstring(xml_content)
        
        course_node = root.find('.//course')
        if course_node is None:
            raise ValueError("Invalid cmi5.xml: No <course> node found.")
            
        course_id = course_node.get('id', '')
        
        title_node = course_node.find('.//title/langstring')
        title = title_node.text if title_node is not None else "cmi5 Course"
        
        aus = []
        for au_node in root.findall('.//au'):
            au_id = au_node.get('id', '')
            
            au_title_node = au_node.find('.//title/langstring')
            au_title = au_title_node.text if au_title_node is not None else "Assignable Unit"
            
            launch_method = au_node.get('launchMethod', 'AnyWindow')
            move_on = au_node.get('moveOn', 'CompletedAndPassed')
            
            mastery_score = None
            mastery_node = au_node.find('.//masteryScore')
            if mastery_node is not None and mastery_node.text:
                try:
                    mastery_score = float(mastery_node.text)
                except ValueError:
                    pass
                    
            url_node = au_node.find('.//url')
            url = url_node.text if url_node is not None else ""
            
            aus.append({
                "id": au_id,
                "title": au_title,
                "launchMethod": launch_method,
                "moveOn": move_on,
                "masteryScore": mastery_score,
                "url": url
            })
            
        return {
            "course": {
                "id": course_id,
                "title": title
            },
            "aus": aus
        }
