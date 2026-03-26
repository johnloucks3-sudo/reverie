"""Bookings endpoint — GET /api/bookings returns Phase 1 fixture."""

from fastapi import APIRouter, HTTPException
from jose import jwt, JWTError
from pydantic import BaseModel

from app.core.config import settings

router = APIRouter()


class Booking(BaseModel):
    type: str
    description: str
    confirmation: str
    status: str
    amount_usd: float | None = None


class BookingsResponse(BaseModel):
    bookings: list[Booking]


@router.get("", response_model=BookingsResponse)
async def get_bookings(authorization: str | None = None):
    """
    Returns Phase 1 hardcoded booking summary.
    Requires valid JWT in Authorization header (Bearer token).
    """
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing authorization header")

    # Extract Bearer token
    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(status_code=401, detail="Invalid authorization header format")

    token = parts[1]

    # Decode JWT
    try:
        payload = jwt.decode(
            token,
            settings.secret_key,
            algorithms=[settings.jwt_algorithm],
        )
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    # Phase 1 hardcoded fixture
    return BookingsResponse(
        bookings=[
            Booking(
                type="flight",
                description="New York (JFK) to Rome (FCO) — United UA 177",
                confirmation="UA-177-JFK-FCO",
                status="confirmed",
                amount_usd=2400.0,
            ),
            Booking(
                type="flight",
                description="Vancouver (YVR) to Rome (FCO) — Air Canada AC 817",
                confirmation="AC-817-YVR-FCO",
                status="confirmed",
                amount_usd=1800.0,
            ),
            Booking(
                type="flight",
                description="Rome (FCO) to Vancouver (YVR) — Air Canada AC 1041",
                confirmation="AC-1041-FCO-YVR",
                status="confirmed",
                amount_usd=1800.0,
            ),
            Booking(
                type="cruise",
                description="Silver Muse Suite 617 — Jun 23–Jul 3 2026 Mediterranean",
                confirmation="SM260623010",
                status="confirmed",
                amount_usd=45000.0,
            ),
        ]
    )
