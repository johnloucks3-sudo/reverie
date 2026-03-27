"""Journey Journal — POST/GET /api/journal
GPS-linked notes, photos, end-of-day debriefs.
SQLite-backed for persistence across restarts.
"""

import sqlite3
import json
from datetime import datetime, timezone
from pathlib import Path

from fastapi import APIRouter, Request
from pydantic import BaseModel

from app.core.auth import get_email

router = APIRouter()

DB_PATH = Path(__file__).parent.parent.parent / "data" / "journal.db"


def _init_db():
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(DB_PATH))
    conn.execute("""
        CREATE TABLE IF NOT EXISTS entries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            lat REAL,
            lon REAL,
            location_name TEXT,
            note TEXT NOT NULL,
            photo_links TEXT DEFAULT '[]',
            tags TEXT DEFAULT '[]',
            mood INTEGER,
            entry_type TEXT DEFAULT 'ad_hoc',
            created_at TEXT NOT NULL
        )
    """)
    conn.commit()
    conn.close()


_init_db()


class JournalEntry(BaseModel):
    note: str
    lat: float | None = None
    lon: float | None = None
    location_name: str | None = None
    photo_links: list[str] = []
    tags: list[str] = []
    mood: int | None = None
    entry_type: str = "ad_hoc"  # ad_hoc | eod_debrief | port_note


@router.get("")
async def get_journal(request: Request):
    email = get_email(request)
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    rows = conn.execute(
        "SELECT * FROM entries WHERE email = ? ORDER BY timestamp DESC",
        (email,),
    ).fetchall()
    conn.close()

    entries = []
    for r in rows:
        entries.append({
            "id": r["id"],
            "timestamp": r["timestamp"],
            "lat": r["lat"],
            "lon": r["lon"],
            "location_name": r["location_name"],
            "note": r["note"],
            "photo_links": json.loads(r["photo_links"]),
            "tags": json.loads(r["tags"]),
            "mood": r["mood"],
            "entry_type": r["entry_type"],
            "created_at": r["created_at"],
        })
    return {"entries": entries}


@router.post("")
async def create_entry(entry: JournalEntry, request: Request):
    email = get_email(request)
    now = datetime.now(timezone.utc).isoformat()
    conn = sqlite3.connect(str(DB_PATH))
    cursor = conn.execute(
        """INSERT INTO entries
           (email, timestamp, lat, lon, location_name, note, photo_links, tags, mood, entry_type, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (
            email,
            now,
            entry.lat,
            entry.lon,
            entry.location_name,
            entry.note,
            json.dumps(entry.photo_links),
            json.dumps(entry.tags),
            entry.mood,
            entry.entry_type,
            now,
        ),
    )
    entry_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return {"id": entry_id, "timestamp": now, "detail": "Entry saved"}


@router.delete("/{entry_id}")
async def delete_entry(entry_id: int, request: Request):
    email = get_email(request)
    conn = sqlite3.connect(str(DB_PATH))
    result = conn.execute(
        "DELETE FROM entries WHERE id = ? AND email = ?",
        (entry_id, email),
    )
    conn.commit()
    conn.close()
    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="Entry not found")
    return {"detail": "Entry deleted"}
