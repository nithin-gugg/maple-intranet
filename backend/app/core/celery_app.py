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
    worker_cancel_long_running_tasks_on_connection_loss=True, # Fixes warning about task cancellation on connection loss
    broker_connection_retry_on_startup=True, # Ensures Celery retries connecting to the broker on startup
    # Keep idle connections alive (Upstash kills idle connections)
    broker_pool_limit=None, # Disable connection pooling for serverless redis
    broker_transport_options={
        "health_check_interval": 30,
        "socket_keepalive": True,
        "retry_on_timeout": True,
        "socket_timeout": 30,
        "socket_connect_timeout": 30,
    },
    redis_backend_health_check_interval=30,
    redis_retry_on_timeout=True,
)

# Auto-discover tasks in all installed apps
celery_app.autodiscover_tasks(["app.workers.tracking_worker"])
