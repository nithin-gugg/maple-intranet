import os
from celery import Celery
from app.core.config import settings

# Configure Celery application
celery_app = Celery(
    "learning_tracking",
    broker=settings.get_celery_broker_url,
    backend=settings.get_celery_result_backend,
)

# TLS configuration is now handled directly via the rediss:// URL parameters

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    # Configure retries
    task_acks_late=True, # Ensure task is ack'ed only after success
    task_reject_on_worker_lost=True, # Requeue on worker crash
    worker_prefetch_multiplier=1, # Don't prefetch too many tracking events to ensure fair distribution
    task_default_retry_delay=5, # initial retry delay
    task_max_retries=5, # Maximum retries before dead-letter
)

# Auto-discover tasks in all installed apps
celery_app.autodiscover_tasks(["app.workers.tracking_worker"])
