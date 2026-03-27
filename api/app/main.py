"""REVERIE API — FastAPI backend (Hetzner CX21)
Phase 1: auth shell + Thunderbird MCP proxy.
Read-only. No database. Magic link + JWT only.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.routers import auth, itinerary, bookings, contact, chat, documents, profile

app = FastAPI(
    title="REVERIE API",
    version="0.2.0",
    docs_url="/api/docs" if settings.debug else None,
    redoc_url=None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(itinerary.router, prefix="/api/itinerary", tags=["itinerary"])
app.include_router(bookings.router, prefix="/api/bookings", tags=["bookings"])
app.include_router(contact.router, prefix="/api/contact", tags=["contact"])
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])
app.include_router(documents.router, prefix="/api/documents", tags=["documents"])
app.include_router(profile.router, prefix="/api/profile", tags=["profile"])


@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "reverie-api"}
