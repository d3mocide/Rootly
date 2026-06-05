import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from auth import get_current_user, hash_password, require_role
from database import get_db
from models.site_settings import SiteSettings
from models.user import User
from schemas.user import UserCreate, UserResponse, UserUpdate

router = APIRouter(prefix="/admin", tags=["admin"])

_admin_dep = [require_role("admin")]


async def _get_or_create_settings(db: AsyncSession) -> SiteSettings:
    result = await db.execute(select(SiteSettings).where(SiteSettings.id == 1))
    s = result.scalar_one_or_none()
    if s is None:
        s = SiteSettings(id=1, signups_enabled=False)
        db.add(s)
        await db.commit()
        await db.refresh(s)
    return s


@router.get("/users", response_model=list[UserResponse], dependencies=_admin_dep)
async def list_users(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).order_by(User.created_at))
    return result.scalars().all()


@router.post("/users", response_model=UserResponse, status_code=status.HTTP_201_CREATED,
             dependencies=_admin_dep)
async def create_user(body: UserCreate, db: AsyncSession = Depends(get_db)):
    existing = (await db.execute(select(User).where(User.email == body.email))).scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    if len(body.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")
    if body.role not in ("admin", "operator"):
        raise HTTPException(status_code=400, detail="Role must be admin or operator")
    user = User(
        email=body.email,
        password_hash=hash_password(body.password),
        display_name=body.display_name,
        role=body.role,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


@router.patch("/users/{user_id}", response_model=UserResponse, dependencies=_admin_dep)
async def update_user(
    user_id: uuid.UUID,
    body: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    user = (await db.execute(select(User).where(User.id == user_id))).scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if body.role is not None:
        if body.role not in ("admin", "operator"):
            raise HTTPException(status_code=400, detail="Role must be admin or operator")
        # Prevent removing own admin role
        if user.id == current_user.id and body.role != "admin":
            raise HTTPException(status_code=400, detail="Cannot remove your own admin role")
        user.role = body.role
    if body.is_active is not None:
        if user.id == current_user.id and not body.is_active:
            raise HTTPException(status_code=400, detail="Cannot disable your own account")
        user.is_active = body.is_active
    if body.display_name is not None:
        user.display_name = body.display_name
    await db.commit()
    await db.refresh(user)
    return user


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=_admin_dep)
async def delete_user(
    user_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    user = (await db.execute(select(User).where(User.id == user_id))).scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    await db.delete(user)
    await db.commit()


@router.get("/settings", dependencies=_admin_dep)
async def get_settings(db: AsyncSession = Depends(get_db)):
    s = await _get_or_create_settings(db)
    return {"signups_enabled": s.signups_enabled}


@router.patch("/settings", dependencies=_admin_dep)
async def update_settings(body: dict, db: AsyncSession = Depends(get_db)):
    s = await _get_or_create_settings(db)
    if "signups_enabled" in body:
        s.signups_enabled = bool(body["signups_enabled"])
    await db.commit()
    return {"signups_enabled": s.signups_enabled}
