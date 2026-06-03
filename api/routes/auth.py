import uuid
from datetime import datetime, timezone

import jwt
from fastapi import APIRouter, Cookie, Depends, HTTPException, Request, Response, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from auth import (
    _dummy_verify,
    check_replay,
    create_access_token,
    create_refresh_token,
    get_current_user,
    hash_password,
    verify_password,
)
from config import settings
from database import get_db
from models.user import User
from schemas.user import ChangePassword, UserLogin, UserResponse, UserSetup

router = APIRouter(prefix="/auth", tags=["auth"])

_COOKIE = dict(httponly=True, secure=settings.production, samesite="strict")


def _set_auth_cookies(response: Response, user_id: uuid.UUID) -> None:
    response.set_cookie("access_token", create_access_token(user_id), **_COOKIE)
    response.set_cookie("refresh_token", create_refresh_token(user_id), **_COOKIE)


def _clear_auth_cookies(response: Response) -> None:
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")


@router.get("/setup-status")
async def setup_status(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(func.count()).select_from(User))
    return {"setup_required": result.scalar() == 0}


@router.post("/setup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def setup(body: UserSetup, response: Response, db: AsyncSession = Depends(get_db)):
    count = (await db.execute(select(func.count()).select_from(User))).scalar()
    if count != 0:
        raise HTTPException(status_code=400, detail="Setup already complete")
    existing = (await db.execute(select(User).where(User.email == body.email))).scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        email=body.email,
        password_hash=hash_password(body.password),
        display_name=body.display_name,
        role="admin",
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    # Seed default areas
    from models.area import Area
    default_areas = [
        Area(user_id=user.id, name="Living room"),
        Area(user_id=user.id, name="Bedroom"),
        Area(user_id=user.id, name="Office"),
        Area(user_id=user.id, name="Kitchen"),
    ]
    db.add_all(default_areas)
    await db.commit()

    _set_auth_cookies(response, user.id)
    return user


@router.post("/login")
async def login(body: UserLogin, response: Response, request: Request, db: AsyncSession = Depends(get_db)):
    await check_replay(request)
    result = await db.execute(select(User).where(User.email == body.email))
    user = result.scalar_one_or_none()
    if not user:
        _dummy_verify()
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    user.last_login_at = datetime.now(timezone.utc)
    await db.commit()
    _set_auth_cookies(response, user.id)
    return {"message": "Logged in"}


@router.post("/logout")
async def logout(response: Response):
    _clear_auth_cookies(response)
    return {"message": "Logged out"}


@router.get("/me", response_model=UserResponse)
async def me(user: User = Depends(get_current_user)):
    return user


@router.post("/refresh")
async def refresh(
    response: Response,
    refresh_token: str = Cookie(default=None),
    db: AsyncSession = Depends(get_db),
):
    exc = HTTPException(status_code=401, detail="Invalid refresh token")
    if not refresh_token:
        raise exc
    try:
        payload = jwt.decode(refresh_token, settings.jwt_secret, algorithms=["HS256"])
        if payload.get("type") != "refresh":
            raise exc
        user_id: str = payload.get("sub")
    except jwt.PyJWTError:
        raise exc
    result = await db.execute(select(User).where(User.id == uuid.UUID(user_id)))
    if not result.scalar_one_or_none():
        raise exc
    response.set_cookie("access_token", create_access_token(uuid.UUID(user_id)), **_COOKIE)
    return {"message": "Token refreshed"}


@router.post("/change-password")
async def change_password(
    body: ChangePassword,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not verify_password(body.current_password, user.password_hash):
        raise HTTPException(status_code=401, detail="Current password incorrect")
    if len(body.new_password) < 8:
        raise HTTPException(status_code=400, detail="New password must be at least 8 characters")
    user.password_hash = hash_password(body.new_password)
    user.is_password_temp = False
    await db.commit()
    return {"message": "Password changed"}
