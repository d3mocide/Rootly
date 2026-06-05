from pydantic import BaseModel, EmailStr
from datetime import datetime
from uuid import UUID
from typing import Literal, Optional


class UserSetup(BaseModel):
    email: EmailStr
    password: str
    display_name: Optional[str] = None


class UserRegister(BaseModel):
    email: EmailStr
    password: str
    display_name: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str
    nonce: Optional[str] = None


class ChangePassword(BaseModel):
    current_password: str
    new_password: str


class UserResponse(BaseModel):
    id: UUID
    email: str
    display_name: Optional[str] = None
    role: str
    is_active: bool
    units: str = "imperial"
    created_at: datetime
    last_login_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class UserPreferences(BaseModel):
    units: Literal["imperial", "metric"]


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    display_name: Optional[str] = None
    role: str = "operator"


class UserUpdate(BaseModel):
    role: Optional[str] = None
    is_active: Optional[bool] = None
    display_name: Optional[str] = None
