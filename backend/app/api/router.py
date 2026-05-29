import asyncio
import json
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from fastapi.responses import FileResponse, StreamingResponse
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.document import DocumentRead
from app.schemas.notification import NotificationRead
from app.services.document import DocumentService
from app.services.notification import NotificationService
from app.core.events import notification_bus

api_router = APIRouter()


# ── Documents ────────────────────────────────────────────────────────────────

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

    if batch:
        success = sum(1 for d in processed if d.status.value == "completed")
        notification_bus.publish({
            "type": "batch_complete",
            "message": f"{success} of {len(processed)} files uploaded successfully",
            "batch_id": batch.id,
        })

    return processed


@api_router.get("/documents", response_model=list[DocumentRead])
def get_documents(db: Session = Depends(get_db)):
    return DocumentService(db).list_documents()


@api_router.get("/documents/{document_id}/download")
def download_document(document_id: str, db: Session = Depends(get_db)):
    doc = DocumentService(db).document_repo.get_by_id(document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    path = Path(doc.storage_path)
    if not path.exists():
        raise HTTPException(status_code=404, detail="File not found on disk")
    return FileResponse(path, media_type="application/pdf", filename=doc.original_filename)


# ── Notifications — static paths BEFORE dynamic /{id} ───────────────────────

@api_router.get("/notifications/unread-count")
def get_unread_count(db: Session = Depends(get_db)):
    return {"count": NotificationService(db).unread_count()}


@api_router.get("/notifications/stream")
async def notifications_stream():
    queue: asyncio.Queue = asyncio.Queue()
    notification_bus.subscribe(queue)

    async def event_generator():
        try:
            while True:
                try:
                    data = await asyncio.wait_for(queue.get(), timeout=25)
                    yield f"data: {json.dumps(data)}\n\n"
                except asyncio.TimeoutError:
                    yield ": ping\n\n"
        finally:
            notification_bus.unsubscribe(queue)

    return StreamingResponse(event_generator(), media_type="text/event-stream")


@api_router.get("/notifications", response_model=list[NotificationRead])
def get_notifications(db: Session = Depends(get_db)):
    return NotificationService(db).list_notifications()


@api_router.post("/notifications/mark-all-read")
def mark_all_notifications_read(db: Session = Depends(get_db)):
    count = NotificationService(db).mark_all_read()
    return {"status": "ok", "updated": count}


@api_router.post("/notifications/mark-read/{notification_id}")
def mark_notification_read(notification_id: str, db: Session = Depends(get_db)):
    notification = NotificationService(db).mark_read(notification_id)
    if notification is None:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"status": "ok", "notification_id": notification_id}
