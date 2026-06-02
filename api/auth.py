from datetime import datetime, timedelta
from uuid import uuid4
from jose import JWTError, jwt
from passlib.context import CryptContext
import redis as redis_lib
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from config import settings
from database import get_db

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
bearer_scheme = HTTPBearer()
redis = redis_lib.from_url(settings.redis_url, decode_responses=True)


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def create_access_token(user_id: str) -> str:
    session_id = str(uuid4())
    expire = datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes)
    token = jwt.encode(
        {"sub": user_id, "sid": session_id, "exp": expire},
        settings.secret_key,
        algorithm=settings.algorithm,
    )
    redis.setex(f"session:{session_id}", settings.session_expire_days * 86400, user_id)
    return token


def get_token_payload(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> dict:
    exc = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired token",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(
            credentials.credentials, settings.secret_key, algorithms=[settings.algorithm]
        )
        user_id: str = payload.get("sub")
        session_id: str = payload.get("sid")
        if not user_id or not session_id:
            raise exc
    except JWTError:
        raise exc

    if not redis.exists(f"session:{session_id}"):
        raise exc

    return {"user_id": user_id, "session_id": session_id}


def revoke_session(session_id: str) -> None:
    redis.delete(f"session:{session_id}")


def get_current_user(
    payload: dict = Depends(get_token_payload),
    db: Session = Depends(get_db),
):
    from models.user import User

    user = db.query(User).filter(User.id == payload["user_id"]).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user
