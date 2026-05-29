from sqlalchemy.orm import Session

from app.models.notification import Notification


class NotificationRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, notification: Notification) -> Notification:
        self.db.add(notification)
        self.db.flush()
        return notification

    def get_all(self) -> list[Notification]:
        return self.db.query(Notification).order_by(Notification.created_at.desc()).all()

    def get_by_id(self, notification_id: str) -> Notification | None:
        return self.db.query(Notification).filter(Notification.id == notification_id).first()

    def get_unread_count(self) -> int:
        return self.db.query(Notification).filter(Notification.read.is_(False)).count()

    def mark_as_read(self, notification: Notification) -> Notification:
        notification.read = True
        self.db.add(notification)
        self.db.flush()
        return notification

    def mark_all_read(self) -> int:
        updated = self.db.query(Notification).filter(Notification.read.is_(False)).update({Notification.read: True})
        self.db.flush()
        return updated
