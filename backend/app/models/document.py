import enum
import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.mysql import CHAR
from sqlalchemy.orm import relationship

from app.db.base import Base


class DocumentStatus(str, enum.Enum):
    pending = "pending"
    uploading = "uploading"
    completed = "completed"
    failed = "failed"


class Document(Base):
    __tablename__ = "documents"

    id = Column(CHAR(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    filename = Column(String(255), nullable=False)
    original_filename = Column(String(255), nullable=False)
    content_type = Column(String(100), nullable=False)
    size_bytes = Column(Integer, nullable=False)
    storage_path = Column(Text, nullable=False)
    status = Column(Enum(DocumentStatus), nullable=False, default=DocumentStatus.pending)
    uploaded_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    batch_id = Column(CHAR(36), ForeignKey("upload_batches.id"), nullable=True)

    batch = relationship("UploadBatch", back_populates="documents")
