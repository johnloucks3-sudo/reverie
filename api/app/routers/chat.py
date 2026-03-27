"""POST /api/chat — Dani Oracle contextual responder
MVP: keyword-matched responses with real trip data.
Phase 2: wire to Thunderbird Dani engine via MCP.
"""

from fastapi import APIRouter, HTTPException, Request
from jose import jwt, JWTError
from pydantic import BaseModel

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


class ChatRequest(BaseModel):
    message: str


# ── Trip knowledge base ──────────────────────────────────────────────
FLIGHTS = [
    {"leg": "COS → SNA", "carrier": "Allegiant G4 3212", "date": "Apr 10", "time": "2:37 PM", "conf": "P5F8XF", "cost": "$200"},
    {"leg": "LAX → HNL", "carrier": "Delta DL 443", "date": "Apr 13", "time": "6:55 PM", "seats": "2C/3A", "conf": "GW4ZHW", "cost": "$1,395.72"},
    {"leg": "HNL → HND", "carrier": "JAL JL 73 Business", "date": "Apr 18", "time": "12:15 PM", "seats": "Sky Suite III 6G/6D", "conf": "FJHPYY", "cost": "$4,093.60"},
    {"leg": "SEA → DEN", "carrier": "Southwest WN 4195", "date": "May 11", "time": "1:55 PM", "seats": "06E/06F", "conf": "ASC3LX", "cost": "$147.80"},
]

HOTELS = [
    {"name": "Newport Beach Marriott Bayview", "dates": "Apr 10-13", "nights": 3, "conf": "79802952", "cost": "$1,008.35"},
    {"name": "Hale Koa Hotel, Waikiki", "dates": "Apr 13-18", "nights": 5, "conf": "10421237", "cost": "$1,545"},
    {"name": "Hilton Tokyo Odaiba", "dates": "Apr 19-23", "nights": 4, "conf": "3337550400", "cost": "$2,770"},
]

EXCURSIONS = [
    {"name": "Kyoto Food Tour with Hiro", "date": "Apr 21", "time": "10 AM", "duration": "3h", "conf": "PE164717508", "cost": "$484.96"},
    {"name": "Mt. Fuji & Hakone Bus Tour", "date": "Apr 22", "time": "7:50 AM", "conf": "PE164714008", "cost": "$365.62"},
    {"name": "Hilton Odaiba → Harumi Port Transfer", "date": "Apr 23", "time": "10:30 AM", "conf": "PE151557101", "cost": "Included"},
    {"name": "Jodogahama & Ryusendo Cave", "date": "Apr 25", "time": "8:45 AM", "duration": "4h"},
    {"name": "Sitka Culinary Adventure", "date": "May 5", "time": "10:30 AM", "duration": "3h"},
    {"name": "Juneau Whale Watching", "date": "May 6", "time": "11:00 AM", "duration": "4h"},
    {"name": "Wrangell John Muir Hike", "date": "May 7", "time": "2:30 PM", "duration": "1h 45m"},
    {"name": "Ketchikan By Land & Sea", "date": "May 8", "time": "12:00 PM", "duration": "1h 30m"},
    {"name": "Victoria Horse-Drawn Trolley", "date": "May 10", "time": "10:00 AM", "duration": "1h"},
]

DINING = [
    {"venue": "La Terrazza", "date": "Apr 23", "time": "18:30", "cost": "Included"},
    {"venue": "The Grill", "date": "Apr 24", "time": "18:30", "cost": "Included (waitlisted)"},
    {"venue": "Kaiseki", "date": "Apr 27", "time": "18:30", "cost": "$160"},
    {"venue": "S.A.L.T. Chef's Table", "date": "Apr 28", "time": "18:30", "cost": "$360"},
    {"venue": "La Terrazza", "date": "Apr 29", "time": "18:30", "cost": "Included"},
    {"venue": "The Grill", "date": "Apr 30", "time": "18:30", "cost": "Included"},
    {"venue": "La Dame", "date": "May 1", "time": "18:30", "cost": "$200"},
    {"venue": "Silver Note", "date": "May 2", "time": "18:30", "cost": "Included"},
    {"venue": "The Grill", "date": "May 3", "time": "18:30", "cost": "Included"},
    {"venue": "La Terrazza", "date": "May 4", "time": "18:30", "cost": "Included"},
    {"venue": "Kaiseki", "date": "May 7", "time": "19:30", "cost": "$160"},
]


def _match_response(msg: str) -> str:
    m = msg.lower()

    # Flights
    if any(w in m for w in ["flight", "fly", "plane", "airport", "allegiant", "delta", "jal", "southwest", "airline"]):
        lines = []
        for f in FLIGHTS:
            seats = f" · Seats {f['seats']}" if "seats" in f else ""
            lines.append(f"  {f['carrier']} · {f['leg']} · {f['date']} {f['time']}{seats}\n  Confirmation: {f['conf']} · {f['cost']}")
        return "Here are all your flights, John:\n\n" + "\n\n".join(lines)

    # Hotels
    if any(w in m for w in ["hotel", "marriott", "hale koa", "hilton", "stay", "room", "accommodation"]):
        lines = []
        for h in HOTELS:
            lines.append(f"  {h['name']} · {h['dates']} ({h['nights']} nights)\n  Confirmation: {h['conf']} · {h['cost']}")
        return "Your hotel reservations:\n\n" + "\n\n".join(lines)

    # Dining
    if any(w in m for w in ["dinner", "dining", "restaurant", "eat", "food", "terrazza", "grill", "kaiseki", "dame", "salt"]):
        lines = [f"  {d['venue']} · {d['date']} at {d['time']} · {d['cost']}" for d in DINING]
        return "Your dining reservations aboard Silver Nova:\n\n" + "\n".join(lines) + "\n\nThe specialty restaurants (Kaiseki, S.A.L.T. Chef's Table, La Dame) have surcharges. All other venues are included with your suite."

    # Excursions
    if any(w in m for w in ["excursion", "tour", "activity", "shore", "kyoto", "fuji", "whale", "hike", "trolley", "sitka", "juneau", "ketchikan", "wrangell", "victoria"]):
        lines = []
        for e in EXCURSIONS:
            dur = f" · {e['duration']}" if "duration" in e else ""
            cost = f" · {e['cost']}" if "cost" in e else ""
            conf = f"\n  Confirmation: {e['conf']}" if "conf" in e else ""
            lines.append(f"  {e['name']} · {e['date']} {e['time']}{dur}{cost}{conf}")
        return "Your excursions and shore activities:\n\n" + "\n\n".join(lines)

    # Japan / Tokyo
    if any(w in m for w in ["japan", "tokyo", "odaiba", "kyoto", "hakone"]):
        return ("Your Japan leg runs April 18-23:\n\n"
                "  JAL Business Class Sky Suite III · HNL → HND · Apr 18 12:15 PM\n"
                "  Arrive Haneda 3:55 PM Apr 19\n"
                "  Hilton Tokyo Odaiba · 4 nights · Apr 19-23\n"
                "  Kyoto Food Tour with Hiro · Apr 21 10 AM (3h)\n"
                "  Mt. Fuji & Hakone Bus Tour · Apr 22 7:50 AM\n"
                "  Transfer to Harumi Port · Apr 23 10:30 AM\n"
                "  Silver Nova embarkation · Apr 23 2:00-4:00 PM\n\n"
                "The Hilton Odaiba has beautiful views of Rainbow Bridge and the Tokyo skyline. Odaiba is an excellent base for exploring the city.")

    # Hawaii / Honolulu
    if any(w in m for w in ["hawaii", "honolulu", "waikiki", "hale koa", "oahu"]):
        return ("Your Hawaii stay runs April 13-18:\n\n"
                "  Delta DL 443 · LAX → HNL · Apr 13 6:55 PM · Seats 2C/3A\n"
                "  Hale Koa Hotel · Waikiki Ocean View · 5 nights\n"
                "  Confirmation: 10421237 · $1,545\n\n"
                "Hale Koa is right on Waikiki Beach with military resort pricing. Five full days to decompress before the Japan leg begins.")

    # Alaska
    if any(w in m for w in ["alaska", "sitka", "juneau", "wrangell", "ketchikan", "inside passage"]):
        return ("Your Alaska ports, May 5-10:\n\n"
                "  Sitka · May 5 — Culinary Adventure 10:30 AM (3h)\n"
                "  Juneau · May 6 — Whale Watching 11:00 AM (4h)\n"
                "  Wrangell · May 7 — John Muir Hike 2:30 PM (1h 45m)\n"
                "  Ketchikan · May 8 — By Land & Sea 12:00 PM (1h 30m)\n"
                "  Inside Passage cruising · May 9\n"
                "  Victoria, BC · May 10 — Horse-Drawn Trolley 10:00 AM (1h)\n\n"
                "The Inside Passage stretch is the scenic highlight — keep your camera ready for glacier views.")

    # Cost / money / total
    if any(w in m for w in ["cost", "total", "price", "spend", "money", "budget", "invest", "how much", "expensive"]):
        return ("Your total trip investment: $22,811.05\n\n"
                "  Flights: $5,837.12\n"
                "  Hotels: $5,323.35\n"
                "  Cruise (Silver Nova): $10,800.00 — paid in full\n"
                "  Excursions & Transfers: $850.58\n\n"
                "All bookings are confirmed. The cruise is paid in full. Specialty dining aboard ($880 total) will be charged to your onboard account.")

    # Ship / cruise / cabin / silver nova
    if any(w in m for w in ["ship", "cruise", "cabin", "silver nova", "nova", "embark", "board", "silversea"]):
        return ("Silver Nova — Superior Veranda Suite 8075\n\n"
                "  Booking: 566910-25 · Status: Paid in Full\n"
                "  Embark: Tokyo (Harumi) · Apr 23, 2:00-4:00 PM\n"
                "  Disembark: Seattle · May 11, 7:00 AM\n"
                "  Duration: 19 nights\n"
                "  Route: Tokyo → Miyako → Pacific Crossing → Alaska → Seattle\n"
                "  8 sea days across the Pacific, 5 Alaska ports\n\n"
                "Your first dinner aboard is La Terrazza at 18:30 on embarkation day.")

    # Newport Beach / California
    if any(w in m for w in ["newport", "california", "marriott", "gregory", "karen"]):
        return ("Newport Beach · April 10-13:\n\n"
                "  Allegiant G4 3212 · COS → SNA · Apr 10 2:37 PM\n"
                "  Newport Beach Marriott Bayview · 3 nights\n"
                "  Confirmation: 79802952 · $1,008.35\n"
                "  Family time with Gregory & Karen on Apr 11-12\n\n"
                "Beautiful start to the journey — three days of family time before the Pacific adventure begins.")

    # Confirmation numbers
    if any(w in m for w in ["confirmation", "booking number", "reference", "conf"]):
        return ("All your confirmation numbers:\n\n"
                "  Allegiant COS→SNA: P5F8XF\n"
                "  Marriott Bayview: 79802952\n"
                "  Delta LAX→HNL: GW4ZHW\n"
                "  Hale Koa Hotel: 10421237\n"
                "  JAL Business HNL→HND: FJHPYY\n"
                "  Hilton Odaiba: 3337550400\n"
                "  Kyoto Food Tour: PE164717508\n"
                "  Fuji/Hakone Tour: PE164714008\n"
                "  Port Transfer: PE151557101\n"
                "  Silver Nova: 566910-25\n"
                "  Southwest SEA→DEN: ASC3LX")

    # Schedule / what's next / upcoming
    if any(w in m for w in ["schedule", "next", "upcoming", "what's coming", "when", "timeline"]):
        return ("Your journey timeline:\n\n"
                "  Apr 10 — Depart Colorado Springs → Newport Beach\n"
                "  Apr 13 — Fly to Honolulu · 5 nights Waikiki\n"
                "  Apr 18 — JAL Business to Tokyo\n"
                "  Apr 21 — Kyoto Food Tour\n"
                "  Apr 22 — Mt. Fuji & Hakone\n"
                "  Apr 23 — Embark Silver Nova\n"
                "  Apr 25 — Miyako port call\n"
                "  Apr 24-May 4 — Pacific Crossing (sea days)\n"
                "  May 5-8 — Alaska ports (Sitka, Juneau, Wrangell, Ketchikan)\n"
                "  May 10 — Victoria, BC\n"
                "  May 11 — Disembark Seattle · Fly home")

    # Greeting / hello
    if any(w in m for w in ["hello", "hi", "hey", "good morning", "good evening"]):
        return "Hello, John. How can I help with your Silver Nova voyage? I have all your flights, hotels, dining, excursions, and ship details at hand."

    # Thank you
    if any(w in m for w in ["thank", "thanks"]):
        return "You're welcome, John. I'm here whenever you need anything for your voyage."

    # Help / what can you do
    if any(w in m for w in ["help", "what can you", "what do you know"]):
        return ("I know everything about your 32-day Silver Nova Pacific Crossing. Ask me about:\n\n"
                "  Flights — all 4 legs with confirmations\n"
                "  Hotels — Marriott, Hale Koa, Hilton Odaiba\n"
                "  Dining — all 11 reservations aboard\n"
                "  Excursions — Japan tours + Alaska shore activities\n"
                "  Ship details — cabin, embark/disembark, route\n"
                "  Costs — full financial breakdown\n"
                "  Confirmation numbers — every booking\n"
                "  Destinations — Japan, Hawaii, Alaska, Newport Beach\n\n"
                "Just ask naturally. I'm Dani, your concierge.")

    # Default
    return ("I'd be happy to help with that, John. For your Silver Nova voyage, I can pull up details on "
            "flights, hotels, dining reservations, excursions, ship details, costs, or any specific destination. "
            "What would you like to know?")


@router.post("")
async def chat(req: ChatRequest, request: Request):
    _get_email(request)
    reply = _match_response(req.message)
    return {"role": "dani", "text": reply}
