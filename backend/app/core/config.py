from pathlib import Path
from typing import ClassVar, List
from urllib.parse import quote_plus

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "Document Management Dashboard"
    BASE_DIR: Path = Path(__file__).resolve().parent.parent
    STORAGE_DIR: Path = BASE_DIR / "storage"

    MYSQL_USER: str = "root"
    MYSQL_PASSWORD: str = "rheni@2005"
    MYSQL_HOST: str = "localhost"
    MYSQL_PORT: str = "3306"
    MYSQL_DB: str = "dm_dashboard"

    UPLOAD_MAX_SIZE_MB: int = 50
    ALLOWED_CONTENT_TYPES: ClassVar[List[str]] = ["application/pdf"]

    @property
    def SQLALCHEMY_DATABASE_URL(self) -> str:
        return f"mysql+pymysql://{self.MYSQL_USER}:{quote_plus(self.MYSQL_PASSWORD)}@{self.MYSQL_HOST}:{self.MYSQL_PORT}/{self.MYSQL_DB}"

    model_config = {"env_file": ".env"}


settings = Settings()
