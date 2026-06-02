from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str
    redis_url: str = "redis://redis:6379"
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    session_expire_days: int = 7


settings = Settings()
