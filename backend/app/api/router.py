from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.document import DocumentRead
from app.schemas.notification import NotificationRead
from app.services.document import DocumentService
from app.services.notification import NotificationService

api_router = APIRouter()


@api_router.post("/documents/upload", response_model=list[DocumentRead])
def upload_documents(
    files: list[UploadFile] = File(...),
    db: Session = Depends(get_db),
):
    document_service = DocumentService(db)
    try:
        documents, batch = document_service.create_documents(files)
    except ValueError as exc:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(exc))

    processed = document_service.save_documents(documents, files, batch)
    return processed


@api_router.get("/documents", response_model=list[DocumentRead])
def get_documents(db: Session = Depends(get_db)):
    service = DocumentService(db)
    return service.list_documents()


@api_router.get("/notifications", response_model=list[NotificationRead])
def get_notifications(db: Session = Depends(get_db)):
    service = NotificationService(db)
    return service.list_notifications()


@api_router.post("/notifications/mark-read/{notification_id}")
def mark_notification_read(notification_id: str, db: Session = Depends(get_db)):
    service = NotificationService(db)
    notification = service.mark_read(notification_id)
    if notification is None:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"status": "ok", "notification_id": notification_id}


@api_router.post("/notifications/mark-all-read")
def mark_all_notifications_read(db: Session = Depends(get_db)):
    service = NotificationService(db)
    count = service.mark_all_read()
    return {"status": "ok", "updated": count}
