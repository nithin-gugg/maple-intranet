from enum import Enum

class PackageStandard(str, Enum):
    SCORM_1_2 = "SCORM_1_2"
    SCORM_2004 = "SCORM_2004"
    XAPI = "XAPI"
    CMI5 = "CMI5"
    UNKNOWN = "UNKNOWN"

class SessionStatus(str, Enum):
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    PASSED = "passed"
    FAILED = "failed"
