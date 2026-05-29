import os
from pathlib import Path
from typing import ClassVar, List
from urllib.parse import quote_plus

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "Document Management Dashboard"
    BASE_DIR: Path = Path(__file__).resolve().parent.parent
    STORAGE_DIR: Path = BASE_DIR / "storage"

    MYSQL_USER: str = os.getenv("MYSQL_USER", "root")
    MYSQL_PASSWORD: str = os.getenv("MYSQL_PASSWORD", "rheni@2005")
    MYSQL_HOST: str = os.getenv("MYSQL_HOST", "localhost")
    MYSQL_PORT: str = os.getenv("MYSQL_PORT", "3306")
    MYSQL_DB: str = os.getenv("MYSQL_DB", "dm_dashboard")

    SQLALCHEMY_DATABASE_URL: str = (
        f"mysql+pymysql://{MYSQL_USER}:{quote_plus(MYSQL_PASSWORD)}@{MYSQL_HOST}:{MYSQL_PORT}/{MYSQL_DB}"
    )
    UPLOAD_MAX_SIZE_MB: int = 50
    ALLOWED_CONTENT_TYPES: ClassVar[List[str]] = ["application/pdf"]

    class Config:
        env_file = ".env"


settings = Settings()
