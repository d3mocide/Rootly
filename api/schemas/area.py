from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional

class AreaCreate(BaseModel):
    name: str

class AreaUpdate(BaseModel):
    name: Optional[str] = None

class AreaResponse(BaseModel):
    id: UUID
    user_id: UUID
    name: str
    created_at: datetime

    model_config = {"from_attributes": True}
