"""POST /api/chat — Dani Oracle via Groq (llama-3.3-70b, ~1s, free tier)
Conversation history persisted per user in SQLite — last 15 turns sent as messages array.
Falls back to keyword responder if Groq unavailable.
"""

import asyncio
import logging
import os
import sqlite3
from datetime import datetime, timezone
from pathlib import Path

import httpx
from fastapi import APIRouter, Request
from pydantic import BaseModel

from app.core.auth import get_email
from app.core.config import settings

_GROQ_API_KEY = settings.groq_api_key
_GROQ_MODEL = settings.groq_model
_GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"

# ── Chat history DB ─────────────────────────────────────────────────
_DB_PATH = Path(__file__).parent.parent.parent / "data" / "journal.db"


def _init_chat_db():
    _DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(_DB_PATH))
    conn.execute("""
        CREATE TABLE IF NOT EXISTS chat_messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_email TEXT NOT NULL,
            role TEXT NOT NULL,
            content TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
    """)
    conn.commit()
    conn.close()


_init_chat_db()


def _load_history(email: str, limit: int = 15) -> list[dict]:
    """Load last N turns for this user, oldest first."""
    conn = sqlite3.connect(str(_DB_PATH))
    conn.row_factory = sqlite3.Row
    rows = conn.execute(
        """SELECT role, content FROM (
               SELECT role, content, created_at FROM chat_messages
               WHERE user_email = ?
               ORDER BY created_at DESC LIMIT ?
           ) ORDER BY created_at ASC""",
        (email, limit),
    ).fetchall()
    conn.close()
    return [{"role": r["role"], "content": r["content"]} for r in rows]


def _save_messages(email: str, user_msg: str, dani_reply: str):
    """Persist both sides of an exchange."""
    now = datetime.now(timezone.utc).isoformat()
    conn = sqlite3.connect(str(_DB_PATH))
    conn.execute(
        "INSERT INTO chat_messages (user_email, role, content, created_at) VALUES (?, ?, ?, ?)",
        (email, "user", user_msg, now),
    )
    conn.execute(
        "INSERT INTO chat_messages (user_email, role, content, created_at) VALUES (?, ?, ?, ?)",
        (email, "dani", dani_reply, now),
    )
    conn.commit()
    conn.close()

router = APIRouter()
logger = logging.getLogger("reverie.chat")

if _GROQ_API_KEY:
    logger.info("Groq configured — Dani AI chat enabled (llama-3.3-70b)")
else:
    logger.warning("GROQ_API_KEY not set — using keyword fallback")


class ChatRequest(BaseModel):
    message: str


# ── Dani system prompt with full trip context ────────────────────────
DANI_SYSTEM_PROMPT = """You are Dani Moreau — the personal travel concierge for John and Susan Loucks.
You work for Dreams2Memories Travel, LLC. This is not a demo. This is real.
John built this app himself for this exact voyage. He's been planning this for over a year.

WHO YOU'RE TALKING TO:
John Loucks — "Yoda." Colorado Springs. Built REVERIE. Deeply organized, detail-oriented, values
precision. He doesn't want cheerleader energy ("Happy to help!") — he wants a concierge who
already knows the answer. Susan Loucks is traveling with him. Acknowledge her when relevant.

YOUR VOICE:
- Warm but precise. Never corporate. No "Certainly!" or "Great question!"
- BREVITY IS THE RULE. Answer in 1-2 sentences. Only add a 3rd if it's genuinely essential.
- Never pad, never summarize, never close with a sign-off line.
- Use their names sparingly — only when it feels natural, not every reply.
- If you notice stress in a question (missed connection, timing worry), acknowledge it first,
  then answer. One sentence of empathy max, then the fact.
- Think text message, not email.

WHAT YOU KNOW:

VOYAGE: Silver Nova Pacific Crossing · 32 days total · Apr 10 – May 11, 2026
Route: Colorado Springs → Newport Beach → Honolulu → Tokyo → Pacific → Alaska → Seattle
Cabin: 8075 Superior Veranda · Deck 8 · Booking: 566910-25 · Paid in full

FLIGHTS:
  Allegiant G4 3212 · COS→SNA · Apr 10 2:37 PM · P5F8XF · $200
  Delta DL 443 · LAX→HNL · Apr 13 6:55 PM · Seats 2C/3A · GW4ZHW · $1,395.72
  JAL JL 73 Business · HNL→HND · Apr 18 12:15 PM · Sky Suite III 6G/6D · FJHPYY · $4,093.60
  Southwest WN 4195 · SEA→DEN · May 11 1:55 PM · Seats 06E/06F · ASC3LX · $147.80

HOTELS:
  Newport Beach Marriott Bayview · Apr 10-13 (3 nights) · 79802952 · $1,008.35
  Hale Koa Hotel, Waikiki Ocean View · Apr 13-18 (5 nights) · 10421237 · $1,545
  Hilton Tokyo Odaiba, Twin Superior Deluxe · Apr 19-23 (4 nights) · 3337550400 · $2,770

PRE-CRUISE EXCURSIONS:
  Kyoto Food Tour with Hiro · Apr 21 10 AM (3h) · PE164717508 · $484.96
  Mt. Fuji & Hakone Bus Tour · Apr 22 7:50 AM · PE164714008 · $365.62
  Hilton Odaiba → Harumi Port Transfer · Apr 23 10:30 AM · PE151557101 · Included

SHIP EXCURSIONS:
  Miyako: Jodogahama & Ryusendo Cave · Apr 25 8:45 AM (4h)
  Sitka: Culinary Adventure · May 5 10:30 AM (3h)
  Juneau: Whale Watching · May 6 11:00 AM (4h)
  Wrangell: John Muir Hike · May 7 2:30 PM (1h 45m)
  Ketchikan: By Land & Sea · May 8 12:00 PM (1h 30m)
  Victoria: Horse-Drawn Trolley · May 10 10:00 AM (1h)

DINING ABOARD (18:30 unless noted):
  Apr 23: La Terrazza · Apr 24: The Grill (waitlisted) · Apr 27: Kaiseki ($160)
  Apr 28: S.A.L.T. Chef's Table ($360) · Apr 29: La Terrazza · Apr 30: The Grill
  May 1: La Dame ($200) · May 2: Silver Note · May 3: The Grill · May 4: La Terrazza
  Alaska ports (May 5-8, 10): La Terrazza or Kaiseki at 19:30

TOTAL INVESTMENT: $22,811.05
  Flights: $5,837.12 · Hotels: $5,323.35 · Cruise: $10,800 · Excursions: $850.58

TOKYO LOGISTICS (for pre-cruise days Apr 19-23):
  Staying at Hilton Odaiba (Tokyo Teleport station, Rinkai Line, R-04)
  To Shinjuku: Tokyo Teleport → Rinkai Line → JR Saikyo → Shinjuku · 7 stops · ~25 min · ¥490
  Suica card recommended for all transit. IC card readers on every turnstile.
  Apr 21: Kyoto day trip (Shinkansen from Tokyo Station, ~2.5h)
  Apr 22: Mt. Fuji tour departs 7:50 AM — confirm hotel lobby meeting point

PROACTIVE BEHAVIOR:
- If John asks about timing, volunteer the next thing coming up on that day too.
- If he mentions a port city, offer one piece of local color that's not already in his notes.
- If he asks about a dining reservation, mention the dress code or setting briefly.
- If he asks about a sea day, remind him of the ship's pool deck or spa — this is a luxury line.
- Never make up confirmation numbers, prices, or details not listed above. If unsure, say so in one sentence.
- If asked outside the trip scope, say: "That's outside what I have — want me to flag it for research?"
- Dress code on Silver Nova: smart casual every night. La Dame and La Terrazza are slightly more formal — jacket suggested but not required. Never invent specifics beyond this. """


def _build_messages(message: str, history: list[dict]) -> list[dict]:
    """Build proper OpenAI-format messages array with history."""
    msgs = [{"role": "system", "content": DANI_SYSTEM_PROMPT}]
    for h in history:
        msgs.append({
            "role": "user" if h["role"] == "user" else "assistant",
            "content": h["content"],
        })
    msgs.append({"role": "user", "content": message})
    return msgs


async def _call_dani(message: str, history: list[dict]) -> str | None:
    """Call Groq with proper messages array. ~1s response."""
    if not _GROQ_API_KEY:
        return None
    try:
        async with httpx.AsyncClient(timeout=20) as client:
            resp = await client.post(
                _GROQ_URL,
                headers={"Authorization": f"Bearer {_GROQ_API_KEY}", "Content-Type": "application/json"},
                json={
                    "model": _GROQ_MODEL,
                    "messages": _build_messages(message, history),
                    "max_tokens": 200,
                    "temperature": 0.7,
                },
            )
            resp.raise_for_status()
            return resp.json()["choices"][0]["message"]["content"].strip()
    except Exception as e:
        logger.error("Groq call failed: %s", e)
        return None


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
    email = get_email(request)
    history = _load_history(email)

    # Try Groq first (~1s, free tier, proper message memory)
    if _GROQ_API_KEY:
        try:
            result = await _call_dani(req.message, history)
            if result:
                _save_messages(email, req.message, result)
                return {"role": "dani", "text": result}
        except Exception as e:
            logger.warning("Groq chat failed, falling back to keywords: %s", e)

    # Keyword fallback
    reply = _keyword_response(req.message)
    _save_messages(email, req.message, reply)
    return {"role": "dani", "text": reply}


@router.delete("/history")
async def clear_history(request: Request):
    """Clear conversation history for this user (fresh start)."""
    email = get_email(request)
    conn = sqlite3.connect(str(_DB_PATH))
    conn.execute("DELETE FROM chat_messages WHERE user_email = ?", (email,))
    conn.commit()
    conn.close()
    return {"cleared": True}
