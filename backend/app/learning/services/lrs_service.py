from abc import ABC, abstractmethod
from typing import Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.learning import XApiStatement
import uuid
import datetime
from sqlalchemy.dialects.postgresql import insert as pg_insert
from app.learning.standards.xapi.adapter import XApiAdapter
from app.models.learning import LearningAttempt

class LRSService(ABC):
    @abstractmethod
    async def store_statement(self, statement: Dict[str, Any]) -> str:
        """Stores a single xAPI statement."""
        pass

    @abstractmethod
    async def get_statements(self, **filters) -> List[Dict[str, Any]]:
        """Retrieves statements matching the filters."""
        pass

class NativeLRSService(LRSService):
    def __init__(self, db: AsyncSession):
        self.db = db

    async def store_statement(self, statement: Dict[str, Any]) -> str:
        statement_id = statement.get("id", str(uuid.uuid4()))
        statement["id"] = statement_id
        
        # Check if statement already exists (Idempotency)
        existing = await self.db.execute(select(XApiStatement).where(XApiStatement.statement_id == statement_id))
        if existing.scalars().first():
            return statement_id
            
        stmt = XApiStatement(
            statement_id=statement_id,
            actor=statement.get("actor", {}),
            verb=statement.get("verb", {}),
            object=statement.get("object", {}),
            result=statement.get("result"),
            context=statement.get("context"),
            authority=statement.get("authority"),
            timestamp=statement.get("timestamp"),
            stored=datetime.datetime.utcnow().isoformat(),
            version=statement.get("version", "1.0.0"),
            raw_statement=statement
        )
        self.db.add(stmt)
        
        # We do NOT call XApiAdapter here, because xapi.py already calls it,
        # which avoids the TypeError (3 arguments given) and duplicate processing!
        
        await self.db.commit()
        return statement_id

    async def get_statements(self, **filters) -> List[Dict[str, Any]]:
        # Simplified retrieval logic
        query = select(XApiStatement)
        if "actor_mbox" in filters:
            # Example filtering logic for JSONB actor:
            # Postgres jsonb filtering could be more advanced here.
            pass
            
        result = await self.db.execute(query)
        records = result.scalars().all()
        return [r.raw_statement for r in records]
