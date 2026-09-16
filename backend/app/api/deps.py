from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.config import settings
from jose import jwt, JWTError
from app.models.core import User

security = HTTPBearer()

async def get_current_user_id(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    token = credentials.credentials
    with open('debug_token.log', 'a') as f: f.write(f'RECEIVED TOKEN: {token}\n')
    try:
        payload = jwt.decode(token, settings.AUTH_SECRET, algorithms=["HS256"])
        with open('debug_token.log', 'a') as f: f.write(f'DECODED PAYLOAD: {payload}\n')
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token payload")
        return user_id
    except JWTError as e:
        with open('debug_token.log', 'a') as f: f.write(f'JWT ERROR: {e}\n')
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
    with open('debug_token.log', 'a') as f: f.write(f'GET_CURRENT_USER: {user_id} -> {user}\n')
    if not user:
        raise HTTPException(status_code=404, detail="User not found in local database")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Inactive user")
    return user

async def require_admin(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> User:
    with open('debug_token.log', 'a') as f: f.write(f'REQUIRE_ADMIN: {user.id} -> {user.role}\n')
    if user.role != "admin":
        print(f"[SECURITY] Unauthorized access attempt by {user.id} to admin API")
        raise HTTPException(status_code=403, detail="Admin access required")
        
    return user

def require_permission(resource: str, action: str):
    async def permission_dependency(
        user: User = Depends(get_current_user),
        db: AsyncSession = Depends(get_db)
    ) -> User:
        # In a fully-fledged RBAC we'd check permission tables. 
        # For now, admin can do everything. Other users are restricted.
        with open('debug_token.log', 'a') as f: f.write(f'REQUIRE_ADMIN: {user.id} -> {user.role}\\n')
        if user.role != "admin":
            raise HTTPException(status_code=403, detail="Permission denied")
                
        return user
    return permission_dependency
