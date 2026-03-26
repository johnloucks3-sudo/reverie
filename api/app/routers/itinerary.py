"""Itinerary endpoint — GET /api/itinerary returns Phase 1 McLeod fixture."""

from fastapi import APIRouter, HTTPException
from jose import jwt, JWTError
from pydantic import BaseModel

from app.core.config import settings

router = APIRouter()


class Port(BaseModel):
    name: str
    date: str
    notes: str | None = None


class ItineraryResponse(BaseModel):
    client_name: str
    voyage_name: str
    voyage_id: str
    embark_date: str
    disembark_date: str
    ports: list[Port]


@router.get("", response_model=ItineraryResponse)
async def get_itinerary(authorization: str | None = None):
    """
    Returns Phase 1 McLeod/McGlasson Silver Muse itinerary fixture.
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

    # Phase 1 hardcoded fixture: McLeod/McGlasson Silver Muse
    return ItineraryResponse(
        client_name="Erik & Wendy McGlasson / Nick & Jamie McLeod",
        voyage_name="Silver Muse",
        voyage_id="SM260623010",
        embark_date="2026-06-23",
        disembark_date="2026-07-03",
        ports=[
            Port(name="Civitavecchia", date="2026-06-23", notes="Embark"),
            Port(name="Civitavecchia/Rome", date="2026-06-24", notes="Day port"),
            Port(name="Naples", date="2026-06-25", notes=None),
            Port(name="Amalfi/Positano", date="2026-06-26", notes="Tender port"),
            Port(name="Taormina", date="2026-06-27", notes="Sicily"),
            Port(name="Valletta", date="2026-06-28", notes="Malta"),
            Port(name="Trapani", date="2026-06-29", notes="Sicily"),
            Port(name="Cagliari", date="2026-06-30", notes="Sardinia"),
            Port(name="Portoferraio", date="2026-07-01", notes="Elba"),
            Port(name="Livorno/Florence", date="2026-07-02", notes="Day port"),
            Port(name="Fusina/Venice", date="2026-07-03", notes="Disembark"),
        ],
    )
