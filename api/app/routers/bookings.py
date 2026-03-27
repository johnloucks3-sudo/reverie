"""GET /api/bookings — Commander's Silver Nova 32-day journey bookings"""

from fastapi import APIRouter, Request

from app.core.auth import get_email

router = APIRouter()


@router.get("")
async def get_bookings(request: Request):
    get_email(request)
    return {
        "bookings": [
            {"type": "flight", "description": "Allegiant G4 3212 · COS → SNA · Apr 10 2:37 PM", "confirmation": "P5F8XF", "status": "confirmed", "amount_usd": 200.0},
            {"type": "hotel", "description": "Newport Beach Marriott Bayview · 3 nights · Apr 10–13", "confirmation": "79802952", "status": "confirmed", "amount_usd": 1008.35},
            {"type": "flight", "description": "Delta DL 443 · LAX → HNL · Apr 13 6:55 PM · Seats 2C/3A", "confirmation": "GW4ZHW", "status": "confirmed", "amount_usd": 1395.72},
            {"type": "hotel", "description": "Hale Koa Hotel · Waikiki Ocean View · 5 nights · Apr 13–18", "confirmation": "10421237", "status": "confirmed", "amount_usd": 1545.0},
            {"type": "flight", "description": "JAL JL 73 Business · HNL → HND · Apr 18 12:15 PM · Sky Suite III 6G/6D", "confirmation": "FJHPYY", "status": "confirmed", "amount_usd": 4093.60},
            {"type": "hotel", "description": "Hilton Tokyo Odaiba · Twin Superior Deluxe · 4 nights · Apr 19–23", "confirmation": "3337550400", "status": "confirmed", "amount_usd": 2770.0},
            {"type": "excursion", "description": "Kyoto Food Tour with Hiro · 3h · Apr 21 10 AM", "confirmation": "PE164717508", "status": "confirmed", "amount_usd": 484.96},
            {"type": "excursion", "description": "Mt. Fuji & Hakone Bus Tour · Apr 22 7:50 AM", "confirmation": "PE164714008", "status": "confirmed", "amount_usd": 365.62},
            {"type": "transfer", "description": "Hilton Odaiba → Harumi Port · 4 pax minibus · Apr 23 10:30 AM", "confirmation": "PE151557101", "status": "confirmed", "amount_usd": 0},
            {"type": "cruise", "description": "Silver Nova · Cabin 8075 Superior Veranda · Tokyo → Seattle · 19 nights", "confirmation": "566910-25", "status": "paid in full", "amount_usd": 10800.0},
            {"type": "flight", "description": "Southwest WN 4195 · SEA → DEN · May 11 1:55 PM · Seats 06E/06F", "confirmation": "ASC3LX", "status": "confirmed", "amount_usd": 147.80},
        ],
    }
