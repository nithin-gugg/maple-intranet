from typing import Dict, Any
import urllib.parse

class Cmi5LaunchManager:
    """
    Handles cmi5 launch URLs and fetch parameters.
    """
    
    @staticmethod
    def generate_launch_url(base_au_url: str, endpoint: str, fetch_url: str, actor: dict, registration: str, activity_id: str) -> str:
        """
        Generates the full URL for launching a cmi5 Assignable Unit (AU).
        The AU expects URL parameters: endpoint, fetch, actor, registration, activityId.
        """
        import json
        params = {
            "endpoint": endpoint,
            "fetch": fetch_url,
            "actor": json.dumps(actor),
            "registration": registration,
            "activityId": activity_id
        }
        
        query = urllib.parse.urlencode(params)
        
        if "?" in base_au_url:
            return f"{base_au_url}&{query}"
        return f"{base_au_url}?{query}"
