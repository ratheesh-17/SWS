from sqlalchemy.orm import Session

from app.models.batch import UploadBatch, BatchStatus


class BatchRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, batch: UploadBatch) -> UploadBatch:
        self.db.add(batch)
        self.db.flush()
        return batch

    def get_by_id(self, batch_id: str) -> UploadBatch | None:
        return self.db.query(UploadBatch).filter(UploadBatch.id == batch_id).first()

    def complete(self, batch: UploadBatch, success_count: int, failure_count: int) -> UploadBatch:
        batch.status = BatchStatus.completed
        batch.success_count = success_count
        batch.failure_count = failure_count
        self.db.add(batch)
        self.db.flush()
        return batch

    def set_failed(self, batch: UploadBatch) -> UploadBatch:
        batch.status = BatchStatus.failed
        self.db.add(batch)
        self.db.flush()
        return batch
