from sqlalchemy.orm import Session

from app.models.notification import Notification, NotificationType
from app.repositories.notification import NotificationRepository


class NotificationService:
    def __init__(self, db: Session):
        self.db = db
        self.notification_repo = NotificationRepository(db)

    def list_notifications(self) -> list[Notification]:
        return self.notification_repo.get_all()

    def unread_count(self) -> int:
        return self.notification_repo.get_unread_count()

    def mark_read(self, notification_id: str) -> Notification | None:
        notification = self.db.query(Notification).filter(Notification.id == notification_id).first()
        if not notification:
            return None
        return self.notification_repo.mark_as_read(notification)

    def mark_all_read(self) -> int:
        return self.notification_repo.mark_all_read()

    def create_alert(self, message: str, type: NotificationType = NotificationType.info, meta: str | None = None) -> Notification:
        notification = Notification(message=message, type=type, meta=meta)
        self.notification_repo.create(notification)
        self.db.commit()
        return notification
