import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.types import UserDefinedType
from database import Base


class CITEXT(UserDefinedType):
    """Maps to the PostgreSQL citext extension for case-insensitive text."""
    cache_ok = True

    def get_col_spec(self, **kw):
        return "CITEXT"


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(CITEXT, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    display_name = Column(String, nullable=True)
    role = Column(String(20), nullable=False, default="operator")
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    last_login_at = Column(DateTime(timezone=True), nullable=True)
    is_password_temp = Column(Boolean, nullable=False, default=False)
    is_active = Column(Boolean, nullable=False, default=True)

    plants = relationship("Plant", back_populates="user", cascade="all, delete-orphan")
