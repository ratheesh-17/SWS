from sqlalchemy.orm import Session

from app.models.document import Document, DocumentStatus


class DocumentRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, document: Document) -> Document:
        self.db.add(document)
        self.db.flush()
        return document

    def get_all(self) -> list[Document]:
        return self.db.query(Document).order_by(Document.uploaded_at.desc()).all()

    def get_by_id(self, document_id: str) -> Document | None:
        return self.db.query(Document).filter(Document.id == document_id).first()

    def update_status(self, document: Document, status: DocumentStatus) -> Document:
        document.status = status
        self.db.add(document)
        self.db.flush()
        return document

    def list_by_batch(self, batch_id: str) -> list[Document]:
        return self.db.query(Document).filter(Document.batch_id == batch_id).all()
