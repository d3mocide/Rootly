from pydantic import BaseModel, model_validator, field_validator
from datetime import datetime, timezone
from uuid import UUID
from typing import Optional, List, Any
from models.plant import PlantStatus


def _normalize_last_water(v):
    if v is None:
        return None
    if isinstance(v, str):
        try:
            v = datetime.fromisoformat(v.replace("Z", "+00:00"))
        except ValueError:
            pass
    if isinstance(v, datetime) and v.tzinfo is not None:
        return v.astimezone(timezone.utc).replace(tzinfo=None)
    return v


class PlantCreate(BaseModel):
    name: str
    species: str = ""
    icon: Optional[Any] = None
    room: str = ""
    moisture: float = 0.5
    status: PlantStatus = PlantStatus.thriving
    every: int = 7
    light: str = ""
    note: str = ""
    growth: List[float] = []
    last_water: Optional[datetime] = None
    plantbook_pid: Optional[str] = None
    min_light_lux: Optional[int] = None
    max_light_lux: Optional[int] = None
    min_temp: Optional[float] = None
    max_temp: Optional[float] = None
    min_env_humid: Optional[float] = None
    max_env_humid: Optional[float] = None

    @field_validator("last_water", mode="before")
    @classmethod
    def validate_last_water(cls, v):
        return _normalize_last_water(v)


class PlantUpdate(BaseModel):
    name: Optional[str] = None
    species: Optional[str] = None
    icon: Optional[Any] = None
    room: Optional[str] = None
    moisture: Optional[float] = None
    status: Optional[PlantStatus] = None
    every: Optional[int] = None
    light: Optional[str] = None
    note: Optional[str] = None
    growth: Optional[List[float]] = None
    last_water: Optional[datetime] = None
    plantbook_pid: Optional[str] = None
    min_light_lux: Optional[int] = None
    max_light_lux: Optional[int] = None
    min_temp: Optional[float] = None
    max_temp: Optional[float] = None
    min_env_humid: Optional[float] = None
    max_env_humid: Optional[float] = None

    @field_validator("last_water", mode="before")
    @classmethod
    def validate_last_water(cls, v):
        return _normalize_last_water(v)


class PlantResponse(BaseModel):
    id: UUID
    user_id: UUID
    name: str
    species: str
    icon: Optional[Any] = None
    room: str
    moisture: float
    status: PlantStatus
    every: int
    light: str
    note: str
    growth: List[float]
    last_water: Optional[datetime]
    created_at: datetime
    plantbook_pid: Optional[str] = None
    min_light_lux: Optional[int] = None
    max_light_lux: Optional[int] = None
    min_temp: Optional[float] = None
    max_temp: Optional[float] = None
    min_env_humid: Optional[float] = None
    max_env_humid: Optional[float] = None

    model_config = {"from_attributes": True}

    @model_validator(mode="before")
    @classmethod
    def calculate_dynamic_fields(cls, data):
        now = datetime.utcnow()
        last_water = getattr(data, "last_water", None) if not isinstance(data, dict) else data.get("last_water")
        created_at = getattr(data, "created_at", None) if not isinstance(data, dict) else data.get("created_at")
        base_date = last_water or created_at or now

        if isinstance(base_date, str):
            try:
                base_date = datetime.fromisoformat(base_date.replace("Z", "+00:00"))
            except Exception:
                base_date = now

        if base_date.tzinfo is not None:
            now_compare = datetime.now(timezone.utc)
        else:
            now_compare = now

        delta_seconds = (now_compare - base_date).total_seconds()
        delta_days = max(0.0, delta_seconds / (24.0 * 3600.0))

        every_val = getattr(data, "every", None) if not isinstance(data, dict) else data.get("every")
        every_val = every_val or 7

        moisture = max(0.0, round(1.0 - (delta_days / every_val), 2))

        if delta_days < 1.0:
            status_val = PlantStatus.watered
        elif delta_days >= every_val:
            status_val = PlantStatus.dry
        elif (every_val - delta_days <= 2.0) or (moisture <= 0.35):
            status_val = PlantStatus.soon
        else:
            status_val = PlantStatus.thriving

        if isinstance(data, dict):
            data["moisture"] = moisture
            data["status"] = status_val
            return data
        else:
            fields = cls.model_fields.keys()
            res = {}
            for field in fields:
                res[field] = getattr(data, field, None)
            res["moisture"] = moisture
            res["status"] = status_val
            return res
