"""POST /api/chat — Dani Oracle via Claude Code SDK ($0, Max plan)
Falls back to keyword responder if SDK unavailable.
"""

import asyncio
import logging

from fastapi import APIRouter, Request
from pydantic import BaseModel

from app.core.auth import get_email

router = APIRouter()
logger = logging.getLogger("reverie.chat")

# ── Claude Code SDK import ──────────────────────────────────────────
_SDK_AVAILABLE = False
_sdk_query = None
_sdk_options_cls = None
_sdk_text_block = None

try:
    from claude_code_sdk import query as _q, ClaudeCodeOptions as _opts
    from claude_code_sdk import TextBlock as _tb
    _sdk_query = _q
    _sdk_options_cls = _opts
    _sdk_text_block = _tb
    _SDK_AVAILABLE = True
    logger.info("Claude Code SDK loaded — Dani AI chat enabled ($0 via Max plan)")
except ImportError:
    logger.warning("Claude Code SDK not available — using keyword fallback")


class ChatRequest(BaseModel):
    message: str


# ── Dani system prompt with full trip context ────────────────────────
DANI_SYSTEM_PROMPT = """You are Dani Moreau, the luxury travel concierge for Dreams2Memories Travel.
You are responding to John Loucks about his Silver Nova Pacific Crossing voyage.
Be warm, knowledgeable, concise. You know every detail of this trip.

TRIP OVERVIEW:
- Travelers: John & Susan Loucks
- Voyage: Silver Nova — 32-day Pacific Crossing
- Full journey: Apr 10 – May 11, 2026
- Route: Colorado Springs → Newport Beach → Honolulu → Tokyo → Pacific Crossing → Alaska → Seattle

FLIGHTS:
- Allegiant G4 3212 · COS → SNA · Apr 10 2:37 PM · Conf: P5F8XF · $200
- Delta DL 443 · LAX → HNL · Apr 13 6:55 PM · Seats 2C/3A · Conf: GW4ZHW · $1,395.72
- JAL JL 73 Business · HNL → HND · Apr 18 12:15 PM · Sky Suite III 6G/6D · Conf: FJHPYY · $4,093.60
- Southwest WN 4195 · SEA → DEN · May 11 1:55 PM · Seats 06E/06F · Conf: ASC3LX · $147.80

HOTELS:
- Newport Beach Marriott Bayview · Apr 10-13 (3 nights) · Conf: 79802952 · $1,008.35
- Hale Koa Hotel, Waikiki Ocean View · Apr 13-18 (5 nights) · Conf: 10421237 · $1,545
- Hilton Tokyo Odaiba, Twin Superior Deluxe · Apr 19-23 (4 nights) · Conf: 3337550400 · $2,770

CRUISE:
- Silver Nova · Cabin 8075 Superior Veranda · Deck 8 · Booking: 566910-25 · Paid in full · $10,800
- Embark: Tokyo (Harumi) Apr 23 2:00-4:00 PM
- Disembark: Seattle May 11 7:00 AM
- 19 nights, 11 sea days, 7 ports of call

PRE-CRUISE EXCURSIONS:
- Kyoto Food Tour with Hiro · Apr 21 10 AM (3h) · Conf: PE164717508 · $484.96
- Mt. Fuji & Hakone Bus Tour · Apr 22 7:50 AM · Conf: PE164714008 · $365.62
- Hilton Odaiba → Harumi Port Transfer · Apr 23 10:30 AM · Conf: PE151557101 · Included

SHIP EXCURSIONS:
- Miyako: Jodogahama & Ryusendo Cave · Apr 25 8:45 AM (4h)
- Sitka: Culinary Adventure · May 5 10:30 AM (3h)
- Juneau: Whale Watching · May 6 11:00 AM (4h)
- Wrangell: John Muir Hike · May 7 2:30 PM (1h 45m)
- Ketchikan: By Land & Sea · May 8 12:00 PM (1h 30m)
- Victoria: Horse-Drawn Trolley · May 10 10:00 AM (1h)

DINING ABOARD (all at 18:30 unless noted):
- Apr 23: La Terrazza · Apr 24: The Grill (waitlisted) · Apr 27: Kaiseki ($160)
- Apr 28: S.A.L.T. Chef's Table ($360) · Apr 29: La Terrazza · Apr 30: The Grill
- May 1: La Dame ($200) · May 2: Silver Note · May 3: The Grill · May 4: La Terrazza
- May 5-8, 10: La Terrazza/Kaiseki at 19:30 (Alaska ports)

TOTAL INVESTMENT: $22,811.05
- Flights: $5,837.12 | Hotels: $5,323.35 | Cruise: $10,800 | Excursions: $850.58

GUIDELINES:
- Address John by name naturally
- Give specific details (confirmation numbers, times, amounts) when relevant
- Keep responses concise — 2-4 sentences for simple questions, more for detailed requests
- You're a knowledgeable concierge, not a chatbot. Warm but professional.
- If asked about something outside the trip data, say you'll look into it."""


def _build_max_plan_env() -> dict[str, str]:
    """Build env dict that strips ANTHROPIC_API_KEY so SDK uses Max plan OAuth."""
    import os
    env = dict(os.environ)
    env.pop("ANTHROPIC_API_KEY", None)
    env.pop("ANTHROPIC_BASE_URL", None)
    return env


async def _call_dani_sdk(message: str) -> str:
    """Call Claude via Code SDK with Dani persona. Returns response text."""
    options = _sdk_options_cls(
        system_prompt=DANI_SYSTEM_PROMPT,
        model="haiku",
        cwd="/home/john/Thunderbird",
        permission_mode="bypassPermissions",
        env=_build_max_plan_env(),
    )

    response_parts: list[str] = []

    try:
        async with asyncio.timeout(30):
            async for msg in _sdk_query(prompt=message, options=options):
                if _sdk_text_block and isinstance(msg, _sdk_text_block):
                    response_parts.append(msg.text)
                elif hasattr(msg, "content"):
                    content = msg.content
                    if isinstance(content, list):
                        for block in content:
                            if _sdk_text_block and isinstance(block, _sdk_text_block):
                                response_parts.append(block.text)
                            elif hasattr(block, "text"):
                                response_parts.append(block.text)
                    elif isinstance(content, str):
                        response_parts.append(content)
    except asyncio.TimeoutError:
        if response_parts:
            return "".join(response_parts)
        return "I'm taking a moment to look that up. Could you try again?"
    except Exception as e:
        err_str = str(e)
        # rate_limit_event is benign — return what we have
        if "rate_limit_event" in err_str or "Unknown message type" in err_str:
            if response_parts:
                return "".join(response_parts)
        logger.error("SDK call failed: %s", e)
        return None

    return "".join(response_parts) if response_parts else None


# ── Keyword fallback ─────────────────────────────────────────────────
def _keyword_response(msg: str) -> str:
    m = msg.lower()

    if any(w in m for w in ["flight", "fly", "plane", "airport", "allegiant", "delta", "jal", "southwest"]):
        return ("Your flights:\n\n"
                "  Allegiant G4 3212 · COS → SNA · Apr 10 2:37 PM · P5F8XF · $200\n"
                "  Delta DL 443 · LAX → HNL · Apr 13 6:55 PM · 2C/3A · GW4ZHW · $1,395.72\n"
                "  JAL JL 73 Business · HNL → HND · Apr 18 12:15 PM · Sky Suite III 6G/6D · FJHPYY · $4,093.60\n"
                "  Southwest WN 4195 · SEA → DEN · May 11 1:55 PM · 06E/06F · ASC3LX · $147.80")

    if any(w in m for w in ["hotel", "marriott", "hale koa", "hilton", "stay"]):
        return ("Your hotels:\n\n"
                "  Newport Beach Marriott Bayview · Apr 10-13 · 79802952 · $1,008.35\n"
                "  Hale Koa Hotel, Waikiki · Apr 13-18 · 10421237 · $1,545\n"
                "  Hilton Tokyo Odaiba · Apr 19-23 · 3337550400 · $2,770")

    if any(w in m for w in ["dinner", "dining", "restaurant", "eat", "food"]):
        return ("Dining aboard Silver Nova — all reservations confirmed at 18:30:\n"
                "  La Terrazza, The Grill, Kaiseki ($160), S.A.L.T. Chef's Table ($360), "
                "La Dame ($200), Silver Note. Alaska ports shift to 19:30.")

    if any(w in m for w in ["cost", "total", "price", "money", "budget"]):
        return "Total trip investment: $22,811.05 — Flights $5,837 | Hotels $5,323 | Cruise $10,800 (paid in full) | Excursions $851"

    if any(w in m for w in ["ship", "cruise", "cabin", "silver nova", "embark"]):
        return "Silver Nova · Cabin 8075 Superior Veranda · Deck 8 · Booking 566910-25 · Paid in full · Embark Tokyo Apr 23 · Disembark Seattle May 11 · 19 nights"

    if any(w in m for w in ["confirmation", "ref", "booking number"]):
        return ("Confirmation numbers:\n"
                "  P5F8XF (Allegiant) · GW4ZHW (Delta) · FJHPYY (JAL) · ASC3LX (Southwest)\n"
                "  79802952 (Marriott) · 10421237 (Hale Koa) · 3337550400 (Hilton)\n"
                "  PE164717508 (Kyoto) · PE164714008 (Fuji) · 566910-25 (Silver Nova)")

    if any(w in m for w in ["hello", "hi", "hey", "good morning"]):
        return "Hello, John. I have all the details for your Silver Nova Pacific Crossing. What would you like to know?"

    if any(w in m for w in ["help", "what can you"]):
        return "I know everything about your 32-day voyage — flights, hotels, dining, excursions, ship details, costs, and confirmation numbers. Just ask naturally."

    return ("I'd be happy to help with that, John. Ask me about flights, hotels, dining, "
            "excursions, ship details, costs, or any destination on your Silver Nova voyage.")


@router.post("")
async def chat(req: ChatRequest, request: Request):
    get_email(request)

    # Try SDK first (free via Max plan)
    if _SDK_AVAILABLE:
        try:
            result = await _call_dani_sdk(req.message)
            if result:
                return {"role": "dani", "text": result}
        except Exception as e:
            logger.warning("SDK chat failed, falling back to keywords: %s", e)

    # Keyword fallback
    reply = _keyword_response(req.message)
    return {"role": "dani", "text": reply}
