from sqlalchemy import Column, Boolean, Integer
from database import Base


class SiteSettings(Base):
    __tablename__ = "site_settings"

    id = Column(Integer, primary_key=True, default=1)
    signups_enabled = Column(Boolean, nullable=False, default=False)
