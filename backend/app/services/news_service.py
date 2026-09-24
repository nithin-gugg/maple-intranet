import httpx
from datetime import datetime, timedelta
import urllib.parse
from app.core.config import settings
from app.schemas.news import NewsArticle, NewsResponse
import logging

logger = logging.getLogger(__name__)

import json
from app.core.redis_client import redis_client
from fastapi.encoders import jsonable_encoder

AI_KEYWORDS = [
    "artificial intelligence", "ai", "generative ai", "ai agents",
    "machine learning", "deep learning", "large language models", "llm",
    "enterprise ai", "ai automation", "ai governance", "ai technology",
    "ai innovation", "ai in business", "ai in education", "ai in healthcare",
    "ai in manufacturing", "digital transformation", "ar", "vr", "immersive technology"
]

AI_NEWS_QUERY = (
    '("artificial intelligence" OR "generative AI" OR "AI agents" OR '
    '"machine learning" OR "large language models" OR "enterprise AI" '
    'OR "AI technology" OR "AI trends")'
)

import asyncio
from eventregistry import EventRegistry, QueryArticlesIter, QueryItems

def _fetch_event_registry(api_key: str, limit: int):
    er = EventRegistry(apiKey=api_key)
    q = QueryArticlesIter(
        keywords=QueryItems.OR([
            "artificial intelligence", "generative AI", 
            "machine learning", "large language models"
        ]),
        dataType=["news", "blog"]
    )
    # Fetch extra to allow for filtering
    return list(q.execQuery(er, sortBy="date", maxItems=limit * 2))

class NewsService:
    @staticmethod
    async def get_ai_news(limit: int = 10) -> NewsResponse:
        if not settings.NEWS_API_KEY:
            logger.warning("NEWS_API_KEY is not configured.")
            return _get_fallback_news()

        cache_key = "cache:ai_news"
        try:
            cached_data_str = await redis_client.get(cache_key)
            if cached_data_str:
                cached_data = json.loads(cached_data_str)
                return NewsResponse(status="success", articles=[NewsArticle(**art) for art in cached_data[:limit]])
        except Exception as e:
            logger.error(f"Redis cache error: {e}")

        try:
            raw_articles = await asyncio.to_thread(_fetch_event_registry, settings.NEWS_API_KEY, limit)
            
            # Filter and Deduplicate
            filtered_articles = []
            seen_titles = set()
            
            for article in raw_articles:
                if not article.get("title") or article.get("title") == "[Removed]":
                    continue
                    
                title = article["title"].strip()
                title_lower = title.lower()
                
                # Deduplicate
                if title_lower in seen_titles:
                    continue
                    
                description = article.get("body") or ""
                # Trim description to a reasonable length for the UI
                if len(description) > 300:
                    description = description[:297] + "..."
                
                # Keyword check
                combined_text = title_lower + " " + description.lower()
                if not any(f" {kw} " in f" {combined_text} " or combined_text.startswith(f"{kw} ") or combined_text.endswith(f" {kw}") for kw in AI_KEYWORDS):
                    if not any(kw in combined_text for kw in ["ai", "machine learning", "intelligence", "llm"]):
                        continue
                
                seen_titles.add(title_lower)
                
                filtered_articles.append(
                    NewsArticle(
                        title=title,
                        description=description,
                        url=article.get("url", ""),
                        image=article.get("image"),
                        source=article.get("source", {}).get("title", "Unknown Source"),
                        publishedAt=article.get("dateTime", "") + "Z" if article.get("dateTime") else ""
                    )
                )
            
            if not filtered_articles:
                return _get_fallback_news()

            # Cache the results for 30 minutes
            try:
                await redis_client.setex(cache_key, 1800, json.dumps(jsonable_encoder(filtered_articles)))
            except Exception as e:
                logger.error(f"Redis cache error: {e}")
            
            return NewsResponse(status="success", articles=filtered_articles[:limit])
            
        except Exception as e:
            logger.error(f"Unexpected error in NewsService (EventRegistry): {e}")
            return _get_fallback_news()

def _get_fallback_news() -> NewsResponse:
    # Provide fallback articles so the carousel always displays on the homepage
    # even if the API key is temporarily invalid, rate-limited, or unauthorized.
    now = datetime.now()
    return NewsResponse(
        status="success",
        articles=[
            NewsArticle(
                title="The Future of Generative AI in the Enterprise Workplace",
                description="How large language models and intelligent agents are rapidly transforming corporate knowledge bases and automating routine tasks.",
                url="#",
                image="https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1000&auto=format&fit=crop",
                source="Tech Insights",
                publishedAt=(now - timedelta(hours=2)).isoformat() + "Z"
            ),
            NewsArticle(
                title="Machine Learning Breakthrough: New Algorithms Reduce Training Time",
                description="Researchers have developed a novel approach to backpropagation that significantly reduces the computational overhead required for deep learning models.",
                url="#",
                image="https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=1000&auto=format&fit=crop",
                source="AI Research Weekly",
                publishedAt=(now - timedelta(hours=5)).isoformat() + "Z"
            ),
            NewsArticle(
                title="Global AI Governance: New Frameworks Proposed for 2026",
                description="International consortiums are meeting this week to discuss standardizing AI safety protocols across borders, focusing on enterprise deployment.",
                url="#",
                image="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1000&auto=format&fit=crop",
                source="Global Tech Policy",
                publishedAt=(now - timedelta(hours=12)).isoformat() + "Z"
            )
        ]
    )

