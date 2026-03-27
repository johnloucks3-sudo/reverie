"""GET /api/documents — Document vault with real booking confirmations"""

from fastapi import APIRouter, Request

from app.core.auth import get_email

router = APIRouter()


@router.get("")
async def get_documents(request: Request):
    get_email(request)
    return {
        "documents": [
            {
                "category": "cruise",
                "title": "Silver Nova Booking Confirmation",
                "detail": "Booking 566910-25 · Cabin 8075 Superior Veranda",
                "status": "paid in full",
                "ref": "566910-25",
            },
            {
                "category": "flight",
                "title": "Allegiant G4 3212 — COS → SNA",
                "detail": "Apr 10 · 2:37 PM",
                "status": "confirmed",
                "ref": "P5F8XF",
            },
            {
                "category": "flight",
                "title": "Delta DL 443 — LAX → HNL",
                "detail": "Apr 13 · 6:55 PM · Seats 2C/3A",
                "status": "confirmed",
                "ref": "GW4ZHW",
            },
            {
                "category": "flight",
                "title": "JAL JL 73 Business — HNL → HND",
                "detail": "Apr 18 · 12:15 PM · Sky Suite III 6G/6D",
                "status": "confirmed",
                "ref": "FJHPYY",
            },
            {
                "category": "flight",
                "title": "Southwest WN 4195 — SEA → DEN",
                "detail": "May 11 · 1:55 PM · Seats 06E/06F",
                "status": "confirmed",
                "ref": "ASC3LX",
            },
            {
                "category": "hotel",
                "title": "Newport Beach Marriott Bayview",
                "detail": "Apr 10-13 · 3 nights",
                "status": "confirmed",
                "ref": "79802952",
            },
            {
                "category": "hotel",
                "title": "Hale Koa Hotel — Waikiki Ocean View",
                "detail": "Apr 13-18 · 5 nights",
                "status": "confirmed",
                "ref": "10421237",
            },
            {
                "category": "hotel",
                "title": "Hilton Tokyo Odaiba — Twin Superior Deluxe",
                "detail": "Apr 19-23 · 4 nights",
                "status": "confirmed",
                "ref": "3337550400",
            },
            {
                "category": "excursion",
                "title": "Kyoto Food Tour with Hiro",
                "detail": "Apr 21 · 10 AM · 3h",
                "status": "confirmed",
                "ref": "PE164717508",
            },
            {
                "category": "excursion",
                "title": "Mt. Fuji & Hakone Bus Tour",
                "detail": "Apr 22 · 7:50 AM",
                "status": "confirmed",
                "ref": "PE164714008",
            },
            {
                "category": "transfer",
                "title": "Hilton Odaiba → Harumi Port",
                "detail": "Apr 23 · 10:30 AM · 4 pax minibus",
                "status": "confirmed",
                "ref": "PE151557101",
            },
        ],
    }
