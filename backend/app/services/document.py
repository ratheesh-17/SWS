from datetime import datetime
from pathlib import Path
from typing import Iterable

from fastapi import UploadFile
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.batch import UploadBatch, BatchStatus
from app.models.document import Document, DocumentStatus
from app.models.notification import Notification, NotificationType
from app.repositories.batch import BatchRepository
from app.repositories.document import DocumentRepository
from app.repositories.notification import NotificationRepository
from app.utils.storage import build_document_path, save_upload_file


class DocumentService:
    def __init__(self, db: Session):
        self.db = db
        self.document_repo = DocumentRepository(db)
        self.batch_repo = BatchRepository(db)
        self.notification_repo = NotificationRepository(db)

    def _validate_upload(self, upload_file: UploadFile) -> None:
        if upload_file.content_type not in settings.ALLOWED_CONTENT_TYPES:
            raise ValueError("Only PDF files are supported.")
        upload_file.file.seek(0, 2)
        size = upload_file.file.tell()
        upload_file.file.seek(0)
        if size > settings.UPLOAD_MAX_SIZE_MB * 1024 * 1024:
            raise ValueError("File is larger than allowed maximum size.")

    def _build_document(self, upload_file: UploadFile, batch_id: str | None = None) -> Document:
        storage_path = build_document_path(upload_file.filename)
        size_bytes = self._size_bytes(upload_file)
        return Document(
            filename=storage_path.name,
            original_filename=upload_file.filename,
            content_type=upload_file.content_type,
            size_bytes=size_bytes,
            storage_path=str(storage_path),
            status=DocumentStatus.uploading,
            uploaded_at=datetime.utcnow(),
            batch_id=batch_id,
        )

    def _size_bytes(self, upload_file: UploadFile) -> int:
        upload_file.file.seek(0, 2)
        size = upload_file.file.tell()
        upload_file.file.seek(0)
        return size

    def create_documents(self, files: list[UploadFile]) -> tuple[list[Document], UploadBatch | None]:
        batch = None
        if len(files) > 3:
            batch = UploadBatch(
                total_files=len(files),
                status=BatchStatus.processing,
            )
            self.batch_repo.create(batch)

        documents = []
        for upload_file in files:
            self._validate_upload(upload_file)
            document = self._build_document(upload_file, batch.id if batch else None)
            self.document_repo.create(document)
            documents.append(document)

        self.db.commit()
        return documents, batch

    def save_documents(self, documents: list[Document], files: list[UploadFile], batch: UploadBatch | None = None) -> list[Document]:
        success, failure = 0, 0
        file_map = {}
        for f in files:
            file_map.setdefault(f.filename, f)

        for document in documents:
            source_file = file_map.get(document.original_filename)
            try:
                path = Path(document.storage_path)
                save_upload_file(source_file, path)
                self.document_repo.update_status(document, DocumentStatus.completed)
                success += 1
            except Exception:
                self.document_repo.update_status(document, DocumentStatus.failed)
                failure += 1

        if batch:
            self.batch_repo.complete(batch, success_count=success, failure_count=failure)
            self.notification_repo.create(
                Notification(
                    message=f"{success} of {success + failure} files uploaded successfully",
                    type=NotificationType.success if failure == 0 else NotificationType.error,
                    created_at=datetime.utcnow(),
                    read=False,
                    meta=f"batch_id={batch.id}",
                )
            )

        self.db.commit()
        return documents

    def list_documents(self) -> list[Document]:
        return self.document_repo.get_all()
