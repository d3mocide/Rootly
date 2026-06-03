from pydantic import BaseModel, EmailStr
from datetime import datetime
from uuid import UUID
from typing import Optional


class UserSetup(BaseModel):
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
    created_at: datetime
    last_login_at: Optional[datetime] = None

    model_config = {"from_attributes": True}
