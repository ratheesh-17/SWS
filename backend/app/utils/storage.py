import os
from pathlib import Path
from uuid import uuid4

from fastapi import UploadFile

from app.core.config import settings


def ensure_storage_dir() -> Path:
    path = settings.STORAGE_DIR
    path.mkdir(parents=True, exist_ok=True)
    return path


def build_document_path(filename: str) -> Path:
    safe_filename = f"{uuid4()}_{os.path.basename(filename)}"
    return ensure_storage_dir() / safe_filename


def save_upload_file(upload_file: UploadFile, destination: Path) -> Path:
    with destination.open("wb") as buffer:
        while True:
            chunk = upload_file.file.read(1024 * 64)
            if not chunk:
                break
            buffer.write(chunk)
    return destination
