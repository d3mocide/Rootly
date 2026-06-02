from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    jwt_secret: str
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    refresh_token_expire_days: int = 7
    database_url: str
    redis_url: str = "redis://redis:6379"
    cors_origins: list[str] = []
    production: bool = False

    model_config = {"env_file": ".env"}


settings = Settings()
