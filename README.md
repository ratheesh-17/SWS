# Document Management Dashboard

A full-stack web application for uploading, tracking, and managing PDF documents with real-time notifications.

## Tech Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Frontend | React (Create React App), plain CSS |
| Backend  | FastAPI (Python)                    |
| Database | MySQL                               |
| Realtime | Server-Sent Events (SSE)            |
| Storage  | Local disk (`backend/app/storage/`) |

## Project Structure

```
DM/
├── backend/
│   └── app/
│       ├── api/router.py          # All API endpoints
│       ├── core/config.py         # Settings & DB URL
│       ├── core/events.py         # SSE pub/sub bus
│       ├── db/                    # SQLAlchemy engine & session
│       ├── models/                # Document, UploadBatch, Notification
│       ├── repositories/          # Data access layer
│       ├── schemas/               # Pydantic response schemas
│       ├── services/              # Business logic
│       └── utils/storage.py       # File save helpers
└── frontend/
    └── src/
        ├── api.js                 # All fetch/XHR/SSE calls
        ├── App.js                 # Root component & state
        └── components/
            ├── Header.jsx         # Nav + notification bell
            ├── UploadZone.jsx     # Drag-drop upload + progress bars
            ├── DocumentTable.jsx  # Document list + download
            ├── NotificationPanel.jsx  # Notification dropdown
            └── Toast.jsx          # SSE toast alerts
```

## Setup

### 1. Database

Create a MySQL database:
```sql
CREATE DATABASE dm_dashboard;
```

### 2. Backend

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Copy and configure environment (defaults work for local MySQL):
```powershell
copy .env.example .env
```

Run the backend:
```powershell
cd ..
uvicorn backend.app.main:app --reload
```

Backend runs at `http://localhost:8000`. Tables are auto-created on startup.

### 3. Frontend

```powershell
cd frontend
npm install
npm start
```

Frontend runs at `http://localhost:3000`.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET`  | `/health` | Health check |
| `POST` | `/api/documents/upload` | Upload one or more PDFs |
| `GET`  | `/api/documents` | List all documents |
| `GET`  | `/api/documents/{id}/download` | Download a document |
| `GET`  | `/api/notifications` | List all notifications |
| `GET`  | `/api/notifications/unread-count` | Get unread count |
| `GET`  | `/api/notifications/stream` | SSE stream for real-time events |
| `POST` | `/api/notifications/mark-read/{id}` | Mark one notification read |
| `POST` | `/api/notifications/mark-all-read` | Mark all notifications read |

## Features

- **Individual & bulk PDF upload** with drag-and-drop or file picker
- **Per-file progress bars** with filename, size, type, and status
- **Bulk mode** (>3 files): shows background processing banner; individual bars still visible in collapsible state
- **Real-time SSE notification** pushed to frontend when bulk batch completes — works even if user navigated away from upload page
- **Notification Center**: persistent bell icon with unread badge, dropdown panel, mark individual/all as read
- **Document table**: searchable list with name, size, type, upload date, status chip, and download link

## Assumptions

- Only PDF files are accepted (validated on both frontend and backend)
- Max file size: 50 MB per file
- No authentication required (single-user prototype)
- Files are stored on local disk under `backend/app/storage/`
- SSE is in-process only — does not survive backend restarts (suitable for single-instance deployment)
