from fastapi import APIRouter
from fastapi.staticfiles import StaticFiles
import os

from app.api.routers import employees, departments, documents, calendar, announcements, learning, ai, analytics, scorm, scorm_runtime, scorm2004_runtime, profile, learning_packages, xapi, cmi5

api_router = APIRouter()
api_router.include_router(profile.router, prefix="/profile", tags=["profile"])
api_router.include_router(employees.router, prefix="/employees", tags=["employees"])
api_router.include_router(departments.router, prefix="/departments", tags=["departments"])
api_router.include_router(documents.router, prefix="/documents", tags=["documents"])
api_router.include_router(calendar.router, prefix="/calendar", tags=["calendar"])
api_router.include_router(announcements.router, prefix="/announcements", tags=["announcements"])
api_router.include_router(learning.router, prefix="/learning", tags=["learning"])
api_router.include_router(learning_packages.router, prefix="/learning-packages", tags=["learning_packages"])
api_router.include_router(ai.router, prefix="/ai", tags=["ai"])
api_router.include_router(scorm.router, prefix="/scorm", tags=["scorm"])
api_router.include_router(scorm_runtime.router, prefix="/scorm/runtime", tags=["scorm_runtime"])
api_router.include_router(scorm2004_runtime.router, prefix="/scorm/2004/runtime", tags=["scorm2004_runtime"])
api_router.include_router(xapi.router, prefix="/xapi", tags=["xapi"])
api_router.include_router(cmi5.router, prefix="/cmi5", tags=["cmi5"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
