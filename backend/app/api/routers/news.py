from fastapi import APIRouter, Query
from app.schemas.news import NewsResponse
from app.services.news_service import NewsService

router = APIRouter()

@router.get("/ai", response_model=NewsResponse)
async def get_ai_news(limit: int = Query(10, ge=1, le=20)):
    """
    Get the latest AI and Technology news.
    """
    return await NewsService.get_ai_news(limit=limit)
