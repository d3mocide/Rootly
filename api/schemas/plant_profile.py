from pydantic import BaseModel
from typing import Optional


class PlantSearchResult(BaseModel):
    pid: str
    display_name: str
    alias: str


class PlantProfileResponse(BaseModel):
    pid: str
    display_name: str
    alias: str
    min_soil_moist: Optional[float] = None
    max_soil_moist: Optional[float] = None
    min_light_lux: Optional[int] = None
    max_light_lux: Optional[int] = None
    min_temp: Optional[float] = None
    max_temp: Optional[float] = None
    min_env_humid: Optional[float] = None
    max_env_humid: Optional[float] = None
    image_url: str

    model_config = {"from_attributes": True}
