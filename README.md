# Document Management Dashboard Backend

A FastAPI backend scaffold for a Document Management Dashboard focusing on PDF upload, notification persistence, and upload batch processing.

## Project structure

- `backend/app/main.py` - FastAPI application entrypoint
- `backend/app/api/router.py` - API routes for documents and notifications
- `backend/app/core/config.py` - application configuration and database connection settings
- `backend/app/db/session.py` - SQLAlchemy engine and session management
- `backend/app/models/` - domain entities: `Document`, `UploadBatch`, `Notification`
- `backend/app/repositories/` - repository layer for data access
- `backend/app/services/` - business logic and upload/notification coordination
- `backend/app/utils/storage.py` - disk storage helpers for file persistence

## Database design

- `documents` table stores uploaded PDF metadata, path, type, size, status, and optional bulk batch reference.
- `upload_batches` table supports bulk upload tracking with total file count, success/failure counts, and batch status.
- `notifications` table stores persisted system alerts including type, timestamp, and read status.

## Setup

1. Create a Python virtual environment.
   ```powershell
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1
   ```

2. Install dependencies.
   ```powershell
   pip install -r backend\requirements.txt
   ```

3. Create a MySQL database named `dm_dashboard` and update `backend\.env.example` values if needed.

4. Run the application.
   ```powershell
   uvicorn backend.app.main:app --reload
   ```

## Endpoints

- `GET /health`
- `POST /api/documents/upload` - upload one or multiple PDFs
- `GET /api/documents` - list uploaded documents
- `GET /api/notifications` - list system notifications
- `POST /api/notifications/mark-read/{notification_id}` - mark a notification as read
- `POST /api/notifications/mark-all-read` - mark all notifications as read

## Notes

- The backend is designed as a clean FastAPI domain with models, repositories, and services.
- Bulk uploads over 3 files create a batch and generate a notification once processing completes.
- Notifications persist in the database and can be fetched by the frontend.
