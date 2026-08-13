import os
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from groq import Groq

from app.core.database import get_db
from app.core.config import settings

router = APIRouter()

# Initialize Groq client using settings which correctly parses the .env file
client = Groq(api_key=settings.GROQ_API_KEY or "placeholder")

class ChatRequest(BaseModel):
    message: str

@router.post("/chat")
async def chat_with_assistant(
    request: ChatRequest,
    db: AsyncSession = Depends(get_db),
    # current_user = Depends(get_current_user)
):
    try:
        completion = client.chat.completions.create(
            model="llama3-8b-8192",
            messages=[
                {"role": "system", "content": "You are a helpful AI assistant for the Maple Intranet, knowledgeable about company policies, documents, and learning courses."},
                {"role": "user", "content": request.message}
            ],
            temperature=0.7,
            max_tokens=1024,
            top_p=1,
            stream=False,
            stop=None,
        )
        return {"response": completion.choices[0].message.content}
    except Exception as e:
        return {"response": f"AI Assistant is currently unavailable. Error: {str(e)}"}
