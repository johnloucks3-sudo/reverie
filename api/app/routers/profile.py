"""GET /api/profile — Traveler profile data"""

from fastapi import APIRouter, HTTPException, Request
from jose import jwt, JWTError

from app.core.config import settings

router = APIRouter()


def _get_email(request: Request) -> str:
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing authorization header")
    try:
        payload = jwt.decode(auth[7:], settings.secret_key, algorithms=[settings.jwt_algorithm])
        return payload.get("sub", "")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")


@router.get("")
async def get_profile(request: Request):
    _get_email(request)
    return {
        "travelers": ["John Loucks", "Susan Loucks"],
        "agency": "Dreams2Memories Travel, LLC",
        "concierge": "Dani Moreau",
        "voyage": {
            "name": "Silver Nova — Pacific Crossing",
            "id": "SN260423019",
            "booking_ref": "566910-25",
            "ship": "Silver Nova",
            "cabin": "8075 — Superior Veranda",
            "deck": 8,
            "embark": "2026-04-23",
            "disembark": "2026-05-11",
            "cruise_nights": 19,
            "full_journey_days": 32,
            "full_journey_start": "2026-04-10",
            "route": "Colorado Springs → Newport Beach → Honolulu → Tokyo → Pacific Crossing → Alaska → Seattle → Home",
        },
        "stats": {
            "total_bookings": 11,
            "flights": 4,
            "hotels": 3,
            "excursions_booked": 7,
            "dining_reservations": 11,
            "countries": ["United States", "Japan", "Canada"],
            "ports_of_call": 7,
            "sea_days": 11,
            "total_invested_usd": 22811.05,
        },
        "loyalty": {
            "silversea": "Silver Endeavour Club",
        },
    }
