from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    jwt_secret: str
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    refresh_token_expire_days: int = 7
    database_url: str
    redis_url: str = "redis://redis:6379"
    cors_origins: str = ""
    production: bool = False
    timezone: str = "UTC"
    plantbook_client_id: str = ""
    plantbook_client_secret: str = ""
    plantbook_api_key: str = ""  # Alternative: API-key auth (Token header), valid for search/detail only
    plantnet_api_key: str = ""

    model_config = {"env_file": ".env", "env_ignore_empty": True}

    def get_cors_origins(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


settings = Settings()
