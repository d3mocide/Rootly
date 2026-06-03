import uuid
import enum
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, JSON, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from database import Base


class PlantStatus(str, enum.Enum):
    dry = "dry"
    soon = "soon"
    thriving = "thriving"
    watered = "watered"
    resting = "resting"


class Plant(Base):
    __tablename__ = "plants"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    species = Column(String, nullable=False, default="")
    icon = Column(JSON, nullable=True)
    room = Column(String, nullable=False, default="")
    moisture = Column(Float, nullable=False, default=0.5)
    status = Column(Enum(PlantStatus), nullable=False, default=PlantStatus.thriving)
    every = Column(Integer, nullable=False, default=7)
    light = Column(String, nullable=False, default="")
    note = Column(String, nullable=False, default="")
    growth = Column(JSON, nullable=False, default=list)
    last_water = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    plantbook_pid = Column(String, ForeignKey("plant_profiles.pid"), nullable=True)
    min_light_lux = Column(Integer, nullable=True)
    max_light_lux = Column(Integer, nullable=True)
    min_temp = Column(Float, nullable=True)
    max_temp = Column(Float, nullable=True)
    min_env_humid = Column(Float, nullable=True)
    max_env_humid = Column(Float, nullable=True)

    user = relationship("User", back_populates="plants")
