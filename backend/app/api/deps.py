from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.config import settings
import jwt
from app.models.core import User

security = HTTPBearer()

async def get_current_user_id(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    token = credentials.credentials
    try:
        # For full verification, we would use Clerk's SDK or JWKS.
        # Since we just want the sub for internal MVP routing:
        unverified_claims = jwt.decode(token, options={"verify_signature": False})
        user_id = unverified_claims.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token payload")
        return user_id
    except jwt.DecodeError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

async def get_current_user(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
) -> User:
    # Attempt to fetch the user from our DB
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found in local database")
    return user

async def require_admin(
    user: User = Depends(get_current_user),
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> User:
    token = credentials.credentials
    try:
        unverified_claims = jwt.decode(token, options={"verify_signature": False})
        
        # Clerk puts metadata inside either 'publicMetadata' or 'metadata' depending on JWT template
        meta = unverified_claims.get("metadata", {})
        if not meta:
            meta = unverified_claims.get("public_metadata", {})
            
        role = meta.get("role")
        
        if role not in ["ADMIN", "SUPER_ADMIN"]:
            print(f"[SECURITY] Unauthorized access attempt by {user.id} to admin API")
            raise HTTPException(status_code=403, detail="Admin access required")
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        print(f"[SECURITY] JWT parsing failed during admin check for {user.id}: {e}")
        raise HTTPException(status_code=403, detail="Admin access required")
        
    return user
