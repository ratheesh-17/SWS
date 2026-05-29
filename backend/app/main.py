from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.core.config import settings
from app.db.session import engine
from app.db.base import Base

try:
    Base.metadata.create_all(bind=engine)
except Exception:
    # Database may not be available in local/test environments; continue so the
    # app can start and provide meaningful error messages on DB endpoints.
    pass

app = FastAPI(
    title="Document Management Dashboard API",
    description="Backend API for upload, document catalog, and notification management.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")


@app.get("/health")
def health_check():
    return {"status": "ok", "database_url": settings.SQLALCHEMY_DATABASE_URL}
