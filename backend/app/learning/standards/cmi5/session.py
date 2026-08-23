import base64
import binascii
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.learning import Cmi5Session

class Cmi5SessionManager:
    """
    Validates and manages CMI5 sessions.
    """
    
    @staticmethod
    async def validate_token(db: AsyncSession, auth_header: str) -> Cmi5Session:
        """
        Parses the Authorization header, extracts the credential based on standard 
        schemes (Basic or Bearer), and validates the active session.
        """
        if not auth_header:
            return None
            
        token = auth_header
        parts = auth_header.strip().split(" ", 1)
        
        if len(parts) == 2:
            scheme = parts[0].lower()
            credential = parts[1]
            
            if scheme == "bearer":
                token = credential
            elif scheme == "basic":
                # Try to base64 decode. Basic auth format is username:password
                try:
                    decoded = base64.b64decode(credential).decode("utf-8")
                    if ":" in decoded:
                        username, password = decoded.split(":", 1)
                        # In cmi5, the auth-token is typically sent as the password
                        token = password
                    else:
                        token = decoded
                except (binascii.Error, UnicodeDecodeError):
                    # Some broken AUs might just send `Basic <token>` directly without base64
                    token = credential
        
        # In case the AU accidentally prepended Bearer twice or similar
        token = token.replace("Bearer ", "").strip()
            
        result = await db.execute(
            select(Cmi5Session)
            .where(Cmi5Session.auth_token == token)
            .where(Cmi5Session.is_active == True)
        )
        return result.scalars().first()

    @staticmethod
    async def terminate_session(db: AsyncSession, session_id: str):
        """
        Marks a session as inactive when the AU sends a terminated statement.
        """
        result = await db.execute(
            select(Cmi5Session).where(Cmi5Session.session_id == session_id)
        )
        session = result.scalars().first()
        if session:
            session.is_active = False
            await db.commit()
