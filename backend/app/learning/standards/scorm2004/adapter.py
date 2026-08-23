from typing import Dict, Any, Optional

class Scorm2004Adapter:
    """
    Handles SCORM 2004 CMI data model translations and business rules.
    """
    
    @staticmethod
    def get_initial_cmi(learner_id: str, learner_name: str) -> Dict[str, str]:
        """Returns the default SCORM 2004 CMI data model required for initialization."""
        return {
            "cmi.learner_id": learner_id,
            "cmi.learner_name": learner_name,
            "cmi.location": "",
            "cmi.completion_status": "unknown",
            "cmi.success_status": "unknown",
            "cmi.score.raw": "",
            "cmi.score.min": "",
            "cmi.score.max": "",
            "cmi.score.scaled": "",
            "cmi.session_time": "PT0H0M0S",
            "cmi.total_time": "PT0H0M0S",
            "cmi.suspend_data": "",
            "cmi.exit": "",
            "cmi.entry": "ab-initio",
            "cmi.mode": "normal",
            "cmi.credit": "credit",
        }

    @staticmethod
    def update_attempt_from_cmi(cmi_data: Dict[str, str]) -> Dict[str, Any]:
        """
        Parses SCORM 2004 CMI data to update the universal LearningAttempt model.
        Returns a dictionary of fields to update on LearningAttempt.
        """
        updates = {}
        
        # 1. Status Mapping (SCORM 2004 splits status into completion and success)
        completion_status = cmi_data.get("cmi.completion_status", "unknown")
        success_status = cmi_data.get("cmi.success_status", "unknown")
        
        if success_status in ["passed", "failed"]:
            updates["status"] = success_status
        elif completion_status in ["completed", "incomplete"]:
            updates["status"] = completion_status
            
        # 2. Score Mapping
        score_scaled = cmi_data.get("cmi.score.scaled")
        score_raw = cmi_data.get("cmi.score.raw")
        
        if score_scaled and score_scaled.strip():
            try:
                updates["score"] = float(score_scaled) * 100 # usually 0.0 to 1.0
            except ValueError:
                pass
        elif score_raw and score_raw.strip():
            try:
                updates["score"] = float(score_raw)
            except ValueError:
                pass
                
        # 3. Progress Mapping
        progress = cmi_data.get("cmi.progress_measure")
        if progress and progress.strip():
            try:
                updates["progress_percent"] = int(float(progress) * 100)
            except ValueError:
                pass
        elif completion_status == "completed":
            updates["progress_percent"] = 100
            
        return updates
