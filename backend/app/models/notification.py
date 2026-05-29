import enum
import uuid
from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, Enum, String, Text
from sqlalchemy.dialects.mysql import CHAR

from app.db.base import Base


class NotificationType(str, enum.Enum):
    info = "info"
    success = "success"
    error = "error"


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(CHAR(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    message = Column(Text, nullable=False)
    type = Column(Enum(NotificationType), nullable=False, default=NotificationType.info)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    read = Column(Boolean, default=False, nullable=False)
    meta = Column(Text, nullable=True)
