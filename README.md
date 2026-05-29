# Document Management Dashboard

A full-stack web application for uploading, tracking, and managing PDF documents with real-time notifications.

## Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | React 19, plain CSS                 |
| Backend   | FastAPI (Python)                    |
| Database  | MySQL + SQLAlchemy                  |
| Realtime  | Server-Sent Events (SSE)            |
| Storage   | Local disk (`backend/app/storage/`) |

## Features

- **Drag-and-drop or file picker** upload for single or multiple PDFs
- **Per-file progress bars** showing filename, size, type, and status (pending / uploading / complete / failed)
- **Bulk mode** (>3 files): shows a background-processing banner; individual bars remain visible in a collapsible state
- **Real-time SSE notification** pushed to the frontend when a bulk batch finishes — received even if the user navigated away
- **Notification Center**: persistent bell icon with unread badge, dropdown panel, mark individual or all as read
- **Document table**: searchable list with name, size, upload date, status chip, and download link

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
        ├── api.js                 # All fetch / SSE calls
        ├── App.js                 # Root component & state
        └── components/
            ├── Header.jsx         # Nav + notification bell
            ├── UploadZone.jsx     # Drag-drop upload + progress bars
            ├── DocumentTable.jsx  # Document list + download
            ├── NotificationPanel.jsx
            └── Toast.jsx          # SSE toast alerts
```

## Setup

### Prerequisites

- Python 3.9+
- Node.js 18+
- MySQL 8+

### 1. Database

```sql
CREATE DATABASE dm_dashboard;
```

### 2. Backend

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
```

Edit `.env` with your MySQL credentials:

```env
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DB=dm_dashboard
```

Start the server (from the project root):

```powershell
uvicorn backend.app.main:app --reload
```

Backend runs at `http://localhost:8000`. Database tables are auto-created on first startup.

### 3. Frontend

```powershell
cd frontend
npm install
npm start
```

Frontend runs at `http://localhost:3000`.

## API Reference

| Method | Path | Description |
|--------|------|-------------|
| `GET`  | `/health` | Health check |
| `POST` | `/api/documents/upload` | Upload one or more PDFs |
| `GET`  | `/api/documents` | List all documents |
| `GET`  | `/api/documents/{id}/download` | Download a document |
| `GET`  | `/api/notifications` | List all notifications |
| `GET`  | `/api/notifications/unread-count` | Get unread count |
| `GET`  | `/api/notifications/stream` | SSE stream for real-time events |
| `POST` | `/api/notifications/mark-read/{id}` | Mark one notification as read |
| `POST` | `/api/notifications/mark-all-read` | Mark all notifications as read |

## Constraints

- PDF files only (validated on both frontend and backend)
- Max file size: 50 MB per file
- No authentication (single-user prototype)
- SSE is in-process — does not survive backend restarts
