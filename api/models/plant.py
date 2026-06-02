import uuid
import enum
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, JSON, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from database import Base


class PlantKind(str, enum.Enum):
    monstera = "monstera"
    fig = "fig"
    pothos = "pothos"
    snake = "snake"
    succulent = "succulent"


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
    kind = Column(Enum(PlantKind), nullable=False)
    room = Column(String, nullable=False, default="")
    moisture = Column(Float, nullable=False, default=0.5)
    status = Column(Enum(PlantStatus), nullable=False, default=PlantStatus.thriving)
    every = Column(Integer, nullable=False, default=7)
    light = Column(String, nullable=False, default="")
    note = Column(String, nullable=False, default="")
    growth = Column(JSON, nullable=False, default=list)
    last_water = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="plants")
