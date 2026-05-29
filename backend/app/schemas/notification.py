from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel


class NotificationType(str, Enum):
    info = "info"
    success = "success"
    error = "error"


class NotificationBase(BaseModel):
    message: str
    type: NotificationType
    created_at: datetime
    read: bool
    meta: Optional[str] = None


class NotificationRead(NotificationBase):
    id: str

    class Config:
        orm_mode = True
