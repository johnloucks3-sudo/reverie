"""GET /api/weather — Port-by-port weather forecasts via Open-Meteo (free, no key)
Caches forecasts for 6 hours to avoid hammering the API.
"""

import time
from datetime import datetime

import httpx
from fastapi import APIRouter, HTTPException, Request
from jose import jwt, JWTError

from app.core.config import settings

router = APIRouter()

# Port coordinates for the Silver Nova voyage
PORT_COORDS: dict[str, tuple[float, float]] = {
    "Colorado Springs": (38.8339, -104.8214),
    "Newport Beach, CA": (33.6189, -117.9298),
    "Honolulu, HI": (21.3069, -157.8583),
    "Tokyo, Japan": (35.6762, 139.6503),
    "Kyoto, Japan": (35.0116, 135.7681),
    "Mt. Fuji & Hakone": (35.3606, 138.7274),
    "Tokyo (Harumi)": (35.6508, 139.7813),
    "Miyako, Iwate": (39.6416, 141.9570),
    "Sitka, Alaska": (57.0531, -135.3300),
    "Juneau, Alaska": (58.3005, -134.4197),
    "Wrangell, Alaska": (56.4713, -132.3767),
    "Ketchikan, Alaska": (55.3422, -131.6461),
    "Victoria, BC": (48.4284, -123.3656),
    "Seattle, WA": (47.6062, -122.3321),
}

# Sea day approximate mid-Pacific positions (for wave/wind data)
SEA_COORDS: dict[str, tuple[float, float]] = {
    "2026-04-24": (35.0, 142.0),   # Day after Tokyo
    "2026-04-26": (38.0, 155.0),   # Early Pacific
    "2026-04-27": (39.0, 160.0),
    "2026-04-28": (40.0, 165.0),
    "2026-04-29": (41.0, 170.0),
    "2026-04-30": (42.0, 175.0),
    "2026-05-01": (43.0, -180.0),  # Crossing date line
    "2026-05-02": (44.0, -175.0),
    "2026-05-03": (46.0, -170.0),
    "2026-05-04": (49.0, -160.0),
    "2026-05-09": (54.0, -135.0),  # Inside Passage
}

# Simple in-memory cache: key -> (timestamp, data)
_cache: dict[str, tuple[float, dict]] = {}
CACHE_TTL = 6 * 3600  # 6 hours


def _get_email(request: Request) -> str:
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing authorization header")
    try:
        payload = jwt.decode(auth[7:], settings.secret_key, algorithms=[settings.jwt_algorithm])
        return payload.get("sub", "")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")


def _find_coords(port_name: str, date: str) -> tuple[float, float] | None:
    """Find coordinates for a port name or sea day."""
    # Check sea coordinates first
    if date in SEA_COORDS:
        return SEA_COORDS[date]

    # Match port name
    for key, coords in PORT_COORDS.items():
        if key.lower() in port_name.lower() or port_name.lower() in key.lower():
            return coords

    # Partial matches
    name_lower = port_name.lower()
    if "honolulu" in name_lower or "hawaii" in name_lower:
        return PORT_COORDS["Honolulu, HI"]
    if "tokyo" in name_lower or "harumi" in name_lower:
        return PORT_COORDS["Tokyo (Harumi)"]
    if "kyoto" in name_lower:
        return PORT_COORDS["Kyoto, Japan"]
    if "fuji" in name_lower or "hakone" in name_lower:
        return PORT_COORDS["Mt. Fuji & Hakone"]
    if "newport" in name_lower:
        return PORT_COORDS["Newport Beach, CA"]
    if "seattle" in name_lower:
        return PORT_COORDS["Seattle, WA"]
    if "sitka" in name_lower:
        return PORT_COORDS["Sitka, Alaska"]
    if "juneau" in name_lower:
        return PORT_COORDS["Juneau, Alaska"]
    if "wrangell" in name_lower:
        return PORT_COORDS["Wrangell, Alaska"]
    if "ketchikan" in name_lower:
        return PORT_COORDS["Ketchikan, Alaska"]
    if "victoria" in name_lower:
        return PORT_COORDS["Victoria, BC"]
    if "miyako" in name_lower:
        return PORT_COORDS["Miyako, Iwate"]
    if "cruising" in name_lower or "pacific" in name_lower or "passage" in name_lower:
        return SEA_COORDS.get(date)

    return None


async def _fetch_forecast(lat: float, lon: float, date: str) -> dict | None:
    """Fetch weather from Open-Meteo for a specific date."""
    cache_key = f"{lat:.2f},{lon:.2f},{date}"
    now = time.time()

    # Check cache
    if cache_key in _cache:
        ts, data = _cache[cache_key]
        if now - ts < CACHE_TTL:
            return data

    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.get(
                "https://api.open-meteo.com/v1/forecast",
                params={
                    "latitude": lat,
                    "longitude": lon,
                    "daily": "temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max,weather_code",
                    "start_date": date,
                    "end_date": date,
                    "temperature_unit": "fahrenheit",
                    "wind_speed_unit": "mph",
                    "precipitation_unit": "inch",
                },
            )
            if resp.status_code != 200:
                return None

            data = resp.json()
            daily = data.get("daily", {})
            if not daily.get("time"):
                return None

            result = {
                "date": date,
                "temp_high_f": daily["temperature_2m_max"][0],
                "temp_low_f": daily["temperature_2m_min"][0],
                "precipitation_in": daily["precipitation_sum"][0],
                "wind_max_mph": daily["wind_speed_10m_max"][0],
                "weather_code": daily["weather_code"][0],
                "condition": _weather_description(daily["weather_code"][0]),
            }
            _cache[cache_key] = (now, result)
            return result
    except Exception:
        return None


def _weather_description(code: int) -> str:
    """WMO weather code to human description."""
    if code == 0:
        return "Clear sky"
    if code in (1, 2, 3):
        return ["Mainly clear", "Partly cloudy", "Overcast"][code - 1]
    if code in (45, 48):
        return "Foggy"
    if code in (51, 53, 55):
        return "Light drizzle"
    if code in (61, 63, 65):
        return ["Light rain", "Moderate rain", "Heavy rain"][code - 61 >> 1] if code <= 63 else "Heavy rain"
    if code in (71, 73, 75):
        return "Snow"
    if code in (80, 81, 82):
        return "Rain showers"
    if code in (95, 96, 99):
        return "Thunderstorm"
    return "Partly cloudy"


@router.get("")
async def get_weather(request: Request):
    """Get weather forecasts for all voyage ports."""
    _get_email(request)

    # Import itinerary data
    from app.routers.itinerary import get_itinerary
    itin = await get_itinerary(request)
    ports = itin["ports"]

    forecasts = []
    for port in ports:
        coords = _find_coords(port["name"], port["date"])
        if not coords:
            forecasts.append({
                "port": port["name"],
                "date": port["date"],
                "type": port["type"],
                "forecast": None,
            })
            continue

        forecast = await _fetch_forecast(coords[0], coords[1], port["date"])
        forecasts.append({
            "port": port["name"],
            "date": port["date"],
            "type": port["type"],
            "lat": coords[0],
            "lon": coords[1],
            "forecast": forecast,
        })

    return {"forecasts": forecasts}
