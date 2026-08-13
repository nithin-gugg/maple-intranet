from abc import ABC, abstractmethod
from typing import Dict, Any, Optional

class LearningStandardAdapter(ABC):
    """Base adapter for all learning standards (SCORM 1.2, SCORM 2004, xAPI, cmi5)"""

    @abstractmethod
    def detect(self, package_path: str) -> bool:
        """Returns True if the package at the given path matches this standard."""
        pass

    @abstractmethod
    def extract(self, package_path: str, destination_dir: str) -> Dict[str, Any]:
        """Extracts and parses the package. Returns standard-specific metadata."""
        pass

    @abstractmethod
    def validate(self, package_path: str) -> Dict[str, Any]:
        """Validates the package before extraction. Returns validation result."""
        pass

    @abstractmethod
    async def create_session(self, package_id: int, user_id: str) -> Dict[str, Any]:
        """Creates a learning session for this standard."""
        pass

    @abstractmethod
    async def get_launch_url(self, package_id: int, session_id: int) -> str:
        """Returns the appropriate launch URL or configuration for this session."""
        pass

    @abstractmethod
    async def get_progress(self, session_id: int) -> Dict[str, Any]:
        """Returns normalized progress (status, progress_percent, score, time)."""
        pass

    @abstractmethod
    async def terminate_session(self, session_id: int) -> Dict[str, Any]:
        """Handles any standard-specific session termination logic."""
        pass
