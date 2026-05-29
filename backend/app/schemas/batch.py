from datetime import datetime
from enum import Enum

from pydantic import BaseModel


class BatchStatus(str, Enum):
    processing = "processing"
    completed = "completed"
    failed = "failed"


class UploadBatchBase(BaseModel):
    status: BatchStatus
    total_files: int
    success_count: int
    failure_count: int
    created_at: datetime


class UploadBatchRead(UploadBatchBase):
    id: str

    class Config:
        orm_mode = True
