from pydantic import BaseModel
from typing import List, Optional

class NewsArticle(BaseModel):
    title: str
    description: Optional[str] = None
    url: str
    image: Optional[str] = None
    source: str
    publishedAt: str

class NewsResponse(BaseModel):
    status: str
    articles: List[NewsArticle]
