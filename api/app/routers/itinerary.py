"""GET /api/itinerary — Commander's Silver Nova 32-day Pacific Crossing"""

from fastapi import APIRouter, Request

from app.core.auth import get_email

router = APIRouter()


@router.get("")
async def get_itinerary(request: Request):
    get_email(request)
    return {
        "client_name": "John & Susan Loucks",
        "voyage_name": "Silver Nova — Pacific Crossing",
        "voyage_id": "SN260423019",
        "booking_ref": "566910-25",
        "ship": "Silver Nova",
        "cabin": "8075 — Superior Veranda",
        "embark_date": "2026-04-23",
        "disembark_date": "2026-05-11",
        "duration_nights": 19,
        "full_journey_days": 32,
        "full_journey_start": "2026-04-10",
        "route": "Tokyo (Harumi) → Seattle",
        "ports": [
            {"name": "Colorado Springs → Newport Beach", "date": "2026-04-10", "type": "pre-cruise", "notes": "Allegiant G4 3212 COS→SNA 2:37 PM · Marriott Bayview 3 nights"},
            {"name": "Newport Beach, CA", "date": "2026-04-11", "type": "pre-cruise", "notes": "Family time with Gregory & Karen"},
            {"name": "Newport Beach, CA", "date": "2026-04-12", "type": "pre-cruise", "notes": ""},
            {"name": "Honolulu, HI", "date": "2026-04-13", "type": "pre-cruise", "notes": "Delta DL 443 LAX→HNL · Hale Koa Hotel, 5 nights"},
            {"name": "Honolulu, HI", "date": "2026-04-14", "type": "pre-cruise", "notes": "Hale Koa · Waikiki"},
            {"name": "Honolulu, HI", "date": "2026-04-15", "type": "pre-cruise", "notes": ""},
            {"name": "Honolulu, HI", "date": "2026-04-16", "type": "pre-cruise", "notes": ""},
            {"name": "Honolulu, HI", "date": "2026-04-17", "type": "pre-cruise", "notes": ""},
            {"name": "Honolulu → Tokyo", "date": "2026-04-18", "type": "pre-cruise", "notes": "JAL JL 73 HNL→HND Business, Sky Suite III, 12:15 PM"},
            {"name": "Tokyo, Japan", "date": "2026-04-19", "type": "pre-cruise", "notes": "Arrive 3:55 PM · Hilton Odaiba, 4 nights"},
            {"name": "Tokyo, Japan", "date": "2026-04-20", "type": "pre-cruise", "notes": "Free day — Odaiba / city exploration"},
            {"name": "Kyoto, Japan", "date": "2026-04-21", "type": "excursion", "notes": "Food Tour with Hiro, 10 AM · Matsumoto Kiyoshi Shijo Kawaramachi"},
            {"name": "Mt. Fuji & Hakone", "date": "2026-04-22", "type": "excursion", "notes": "Bus Tour, 7:50 AM departure"},
            {"name": "Tokyo (Harumi)", "date": "2026-04-23", "type": "embark", "notes": "Silver Nova embarkation 2:00–4:00 PM · La Terrazza 18:30"},
            {"name": "Cruising — Pacific", "date": "2026-04-24", "type": "sea", "notes": "The Grill 18:30 (waitlisted)"},
            {"name": "Miyako, Iwate", "date": "2026-04-25", "type": "port", "notes": "Jodogahama & Ryusendo Cave 08:45, 4h"},
            {"name": "Aomori, Japan", "date": "2026-04-26", "type": "port", "notes": "Hirosaki Park cherry blossoms · Nebuta Festival Museum"},
            {"name": "Cruising — Pacific", "date": "2026-04-27", "type": "sea", "notes": "Kaiseki 18:30 · $160"},
            {"name": "Cruising — Pacific", "date": "2026-04-28", "type": "sea", "notes": "S.A.L.T. Chef's Table 18:30 · $360"},
            {"name": "Cruising — Pacific", "date": "2026-04-29", "type": "sea", "notes": "La Terrazza 18:30"},
            {"name": "Cruising — Pacific", "date": "2026-04-30", "type": "sea", "notes": "The Grill 18:30"},
            {"name": "Cruising — Pacific", "date": "2026-05-01", "type": "sea", "notes": "La Dame 18:30 · $200"},
            {"name": "Cruising — Pacific", "date": "2026-05-02", "type": "sea", "notes": "Silver Note 18:30"},
            {"name": "Cruising — Pacific", "date": "2026-05-03", "type": "sea", "notes": "The Grill 18:30"},
            {"name": "Cruising — Pacific", "date": "2026-05-04", "type": "sea", "notes": "La Terrazza 18:30"},
            {"name": "Sitka, Alaska", "date": "2026-05-05", "type": "port", "notes": "Culinary Adventure 10:30, 3h · La Terrazza 19:30"},
            {"name": "Juneau, Alaska", "date": "2026-05-06", "type": "port", "notes": "Whale Watching 11:00, 4h · La Terrazza 19:30"},
            {"name": "Wrangell, Alaska", "date": "2026-05-07", "type": "port", "notes": "John Muir Hike 14:30, 1h 45m · Kaiseki 19:30 · $160"},
            {"name": "Ketchikan, Alaska", "date": "2026-05-08", "type": "port", "notes": "By Land & Sea 12:00, 1h 30m · La Terrazza 19:30"},
            {"name": "Cruising — Inside Passage", "date": "2026-05-09", "type": "sea", "notes": "The Grill 18:30"},
            {"name": "Victoria, BC", "date": "2026-05-10", "type": "port", "notes": "Horse-Drawn Trolley 10:00, 1h · La Terrazza 19:30"},
            {"name": "Seattle, WA", "date": "2026-05-11", "type": "disembark", "notes": "Disembark 7:00 AM · Southwest WN 4195 SEA→DEN 1:55 PM"},
        ],
    }
