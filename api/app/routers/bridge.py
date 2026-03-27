"""GET /api/bridge — Mini-Bridge data: route, ports, ship info, voyage progress"""

from datetime import date

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


# Full route waypoints for map plotting: [lat, lon, label, date, type]
ROUTE_WAYPOINTS = [
    [38.8339, -104.8214, "Colorado Springs", "2026-04-10", "origin"],
    [33.6189, -117.9298, "Newport Beach", "2026-04-10", "pre-cruise"],
    [21.3069, -157.8583, "Honolulu", "2026-04-13", "pre-cruise"],
    [35.5494, 139.7798, "Haneda Airport", "2026-04-19", "pre-cruise"],
    [35.6272, 139.7725, "Tokyo (Odaiba)", "2026-04-19", "pre-cruise"],
    [35.0116, 135.7681, "Kyoto", "2026-04-21", "excursion"],
    [35.3606, 138.7274, "Mt. Fuji", "2026-04-22", "excursion"],
    [35.6508, 139.7813, "Tokyo (Harumi)", "2026-04-23", "embark"],
    [39.6416, 141.9570, "Miyako", "2026-04-25", "port"],
    # Pacific crossing approximate waypoints
    [40.0, 155.0, "Pacific Ocean", "2026-04-27", "sea"],
    [42.0, 170.0, "Pacific Ocean", "2026-04-29", "sea"],
    [44.0, -175.0, "International Date Line", "2026-05-01", "sea"],
    [48.0, -160.0, "North Pacific", "2026-05-03", "sea"],
    [52.0, -145.0, "Gulf of Alaska", "2026-05-04", "sea"],
    # Alaska ports
    [57.0531, -135.3300, "Sitka", "2026-05-05", "port"],
    [58.3005, -134.4197, "Juneau", "2026-05-06", "port"],
    [56.4713, -132.3767, "Wrangell", "2026-05-07", "port"],
    [55.3422, -131.6461, "Ketchikan", "2026-05-08", "port"],
    # Inside Passage & home
    [54.0, -133.0, "Inside Passage", "2026-05-09", "sea"],
    [48.4284, -123.3656, "Victoria", "2026-05-10", "port"],
    [47.6062, -122.3321, "Seattle", "2026-05-11", "disembark"],
]


def _compute_progress() -> dict:
    """Compute voyage progress based on current date."""
    today = date.today()
    journey_start = date(2026, 4, 10)
    embark = date(2026, 4, 23)
    disembark = date(2026, 5, 11)
    journey_end = date(2026, 5, 11)

    total_days = (journey_end - journey_start).days
    elapsed = (today - journey_start).days

    if today < journey_start:
        phase = "pre-departure"
        days_until = (journey_start - today).days
        pct = 0
    elif today < embark:
        phase = "pre-cruise"
        days_until = (embark - today).days
        pct = round(elapsed / total_days * 100)
    elif today <= disembark:
        phase = "at-sea"
        days_until = (disembark - today).days
        pct = round(elapsed / total_days * 100)
    else:
        phase = "completed"
        days_until = 0
        pct = 100

    # Find current/next waypoint
    current_wp = None
    next_wp = None
    for wp in ROUTE_WAYPOINTS:
        wp_date = date.fromisoformat(wp[3])
        if wp_date <= today:
            current_wp = wp
        elif next_wp is None and wp_date > today:
            next_wp = wp

    return {
        "phase": phase,
        "journey_day": max(0, elapsed + 1) if today >= journey_start else 0,
        "total_days": total_days,
        "days_remaining": max(0, (journey_end - today).days),
        "days_until_embark": max(0, (embark - today).days),
        "progress_pct": min(100, max(0, pct)),
        "current_position": {
            "lat": current_wp[0] if current_wp else 38.8339,
            "lon": current_wp[1] if current_wp else -104.8214,
            "label": current_wp[2] if current_wp else "Colorado Springs",
        },
        "next_destination": {
            "label": next_wp[2] if next_wp else None,
            "date": next_wp[3] if next_wp else None,
        },
    }


@router.get("")
async def get_bridge(request: Request):
    _get_email(request)

    progress = _compute_progress()

    return {
        "ship": {
            "name": "Silver Nova",
            "operator": "Silversea Cruises",
            "gross_tonnage": 54700,
            "length_m": 244,
            "passengers": 728,
            "crew": 580,
            "year_built": 2023,
            "flag": "Bahamas",
            "imo": "9855716",
        },
        "voyage": {
            "id": "SN260423019",
            "route": "Tokyo (Harumi) → Seattle",
            "embark_port": "Tokyo (Harumi)",
            "embark_date": "2026-04-23",
            "disembark_port": "Seattle, WA",
            "disembark_date": "2026-05-11",
            "cruise_nights": 19,
        },
        "progress": progress,
        "waypoints": ROUTE_WAYPOINTS,
        "map_config": {
            "center": [40.0, -180.0],  # Mid-Pacific
            "zoom": 3,
            "bounds": [[20.0, -130.0], [60.0, 145.0]],  # Viewport to show full route
        },
    }
