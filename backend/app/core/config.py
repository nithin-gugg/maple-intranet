import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "Maple Intranet"
    # Postgres connection string for asyncpg
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/maple_intranet"
    CLERK_SECRET_KEY: str = ""
    GROQ_API_KEY: str | None = None
    SUPABASE_URL: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    NEWS_API_KEY: str | None = None
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # Celery Configuration
    CELERY_BROKER_URL: str | None = None
    CELERY_RESULT_BACKEND: str | None = None
    
    @property
    def get_celery_broker_url(self) -> str:
        return self.CELERY_BROKER_URL or self.REDIS_URL
        
    @property
    def get_celery_result_backend(self) -> str:
        return self.CELERY_RESULT_BACKEND or self.REDIS_URL

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()
