from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel


class DocumentStatus(str, Enum):
    pending = "pending"
    uploading = "uploading"
    completed = "completed"
    failed = "failed"


class DocumentBase(BaseModel):
    filename: str
    original_filename: str
    content_type: str
    size_bytes: int
    status: DocumentStatus
    storage_path: str
    uploaded_at: datetime
    batch_id: Optional[str] = None


class DocumentRead(DocumentBase):
    id: str

    class Config:
        orm_mode = True
