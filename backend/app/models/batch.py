import enum
import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, Enum, Integer
from sqlalchemy.dialects.mysql import CHAR
from sqlalchemy.orm import relationship

from app.db.base import Base


class BatchStatus(str, enum.Enum):
    processing = "processing"
    completed = "completed"
    failed = "failed"


class UploadBatch(Base):
    __tablename__ = "upload_batches"

    id = Column(CHAR(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    status = Column(Enum(BatchStatus), nullable=False, default=BatchStatus.processing)
    total_files = Column(Integer, nullable=False, default=0)
    success_count = Column(Integer, nullable=False, default=0)
    failure_count = Column(Integer, nullable=False, default=0)

    documents = relationship("Document", back_populates="batch", cascade="all, delete-orphan")
