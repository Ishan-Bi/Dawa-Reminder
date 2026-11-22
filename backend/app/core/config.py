"""
Core configuration settings for DawaReminder backend.
"""
from typing import List, Union
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field, field_validator, model_validator


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(".env", "backend/.env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

    ENVIRONMENT: str = "development"
    PORT: int = 8000
    APP_NAME: str = "DawaReminder API"
    APP_VERSION: str = "1.0.0"

    # Database
    DATABASE_URL: str = Field(
        default="sqlite+aiosqlite:///./dawareminder.db",
        description="Async SQLAlchemy database connection string"
    )

    # Auth & Sessions
    SESSION_SECRET: str = Field(
        default="dev_session_secret_change_in_production_min_32_chars_1234567890",
        description="Secret key for signing caregiver session cookies"
    )
    SESSION_COOKIE_NAME: str = "dawa_session"
    SESSION_MAX_AGE_SECONDS: int = 60 * 60 * 24 * 30  # 30 days

    @model_validator(mode="after")
    def require_production_session_secret(self):
        if self.ENVIRONMENT.lower() == "production" and (
            self.SESSION_SECRET.startswith("dev_") or len(self.SESSION_SECRET) < 32
        ):
            raise ValueError("Production requires a SESSION_SECRET of at least 32 characters")
        if self.ENVIRONMENT.lower() == "production":
            database_url = self.DATABASE_URL.lower()
            if not database_url.startswith(("postgres://", "postgresql://", "postgresql+asyncpg://")):
                raise ValueError(
                    "Production requires a PostgreSQL DATABASE_URL; SQLite is only for local development"
                )
        return self

    # Cloudinary
    CLOUDINARY_URL: str = ""
    CLOUDINARY_CLOUD_NAME: str = ""
    CLOUDINARY_API_KEY: str = ""
    CLOUDINARY_API_SECRET: str = ""

    # CORS
    ALLOWED_ORIGINS: Union[str, List[str]] = "http://localhost:3000,http://localhost:5173"

    @property
    def cors_origins(self) -> List[str]:
        if isinstance(self.ALLOWED_ORIGINS, list):
            return self.ALLOWED_ORIGINS
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT.lower() == "production"

    @property
    def async_database_url(self) -> str:
        """
        Ensures the database URL uses an async driver.
        Neon/Render provides postgres:// or postgresql://, which must use postgresql+asyncpg://
        Neon connection strings use sslmode=require, while asyncpg expects ssl=require.
        """
        url = self.DATABASE_URL
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql+asyncpg://", 1)
        elif url.startswith("postgresql://") and not url.startswith("postgresql+asyncpg://"):
            url = url.replace("postgresql://", "postgresql+asyncpg://", 1)

        parsed = urlsplit(url)
        query = parse_qsl(parsed.query, keep_blank_values=True)
        # channel_binding is a libpq/psycopg option, not an asyncpg connect argument.
        query = [(key, value) for key, value in query if key != "channel_binding"]
        sslmode_values = [value for key, value in query if key == "sslmode"]
        if sslmode_values:
            query = [(key, value) for key, value in query if key != "sslmode"]
            if not any(key == "ssl" for key, _ in query):
                query.append(("ssl", sslmode_values[-1]))
            url = urlunsplit(parsed._replace(query=urlencode(query)))
        return url


settings = Settings()
