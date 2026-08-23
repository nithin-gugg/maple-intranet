from typing import Dict, Any

class Cmi5MoveOnEvaluator:
    """
    Evaluates whether the AU has satisfied its moveOn criteria based on received xAPI statements.
    """
    
    @staticmethod
    def evaluate(move_on_rule: str, verbs_received: set[str]) -> bool:
        """
        Evaluates the moveOn rule against a set of verbs (e.g., 'completed', 'passed').
        Returns True if the learner is allowed to move on.
        """
        # ADL standard verb IDs usually end with these
        has_completed = "completed" in verbs_received
        has_passed = "passed" in verbs_received
        
        if move_on_rule == "NotApplicable":
            return True
        elif move_on_rule == "Completed":
            return has_completed
        elif move_on_rule == "Passed":
            return has_passed
        elif move_on_rule == "CompletedAndPassed":
            return has_completed and has_passed
        elif move_on_rule == "CompletedOrPassed":
            return has_completed or has_passed
            
        # Default strict fallback
        return has_completed and has_passed
