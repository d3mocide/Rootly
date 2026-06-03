from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, DateTime
from database import Base


class PlantProfile(Base):
    __tablename__ = "plant_profiles"

    pid = Column(String, primary_key=True)
    display_name = Column(String, nullable=False)
    alias = Column(String, nullable=False, default="")
    min_soil_moist = Column(Float, nullable=True)
    max_soil_moist = Column(Float, nullable=True)
    min_light_lux = Column(Integer, nullable=True)
    max_light_lux = Column(Integer, nullable=True)
    min_temp = Column(Float, nullable=True)
    max_temp = Column(Float, nullable=True)
    min_env_humid = Column(Float, nullable=True)
    max_env_humid = Column(Float, nullable=True)
    image_url = Column(String, nullable=False, default="")
    fetched_at = Column(DateTime, default=datetime.utcnow)
