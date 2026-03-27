"""Magic link auth — POST /api/auth/magic → email link → GET /api/auth/verify/{token}"""

import base64
import fcntl
import json
import logging
import os
import secrets
from datetime import datetime, timedelta
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from pathlib import Path

from fastapi import APIRouter, HTTPException
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from jose import jwt
from pydantic import BaseModel, EmailStr

from app.core.config import settings

router = APIRouter()
logger = logging.getLogger("reverie.auth")

# ── Persistent file-based token store ───────────────────────────────
# Survives API restarts. File-locked for concurrent safety.
_TOKEN_STORE_PATH = Path("/home/john/Thunderbird/reverie/api/.reverie_tokens.json")


def _load_tokens() -> dict[str, dict]:
    """Load pending tokens from disk. Returns {} if file missing or corrupt."""
    if not _TOKEN_STORE_PATH.exists():
        return {}
    try:
        with open(_TOKEN_STORE_PATH, "r") as f:
            raw: dict[str, dict] = json.load(f)
        # Purge expired tokens on load
        now = datetime.utcnow().isoformat()
        return {k: v for k, v in raw.items() if v.get("expires", "") > now}
    except Exception as e:
        logger.warning("Token store read failed, starting fresh: %s", e)
        return {}


def _save_tokens(tokens: dict[str, dict]) -> None:
    """Persist tokens to disk with exclusive lock."""
    try:
        _TOKEN_STORE_PATH.parent.mkdir(parents=True, exist_ok=True)
        tmp = str(_TOKEN_STORE_PATH) + ".tmp"
        with open(tmp, "w") as f:
            fcntl.flock(f, fcntl.LOCK_EX)
            json.dump(tokens, f, default=str)
            fcntl.flock(f, fcntl.LOCK_UN)
        os.replace(tmp, _TOKEN_STORE_PATH)
    except Exception as e:
        logger.error("Token store write failed: %s", e)


# Email whitelist — only these addresses can request magic links
ALLOWED_EMAILS = {
    "johnloucks3@gmail.com",
    "susanloucks@gmail.com",
}

GMAIL_TOKEN_PATH = "/home/john/Thunderbird/gmail_token.json"
GMAIL_SCOPES = ["https://www.googleapis.com/auth/gmail.send"]


class MagicRequest(BaseModel):
    email: EmailStr


@router.post("/magic")
async def request_magic_link(req: MagicRequest):
    if req.email.lower() not in ALLOWED_EMAILS:
        # Return same response to prevent email enumeration
        return {"detail": "Magic link sent"}

    token = secrets.token_urlsafe(32)
    tokens = _load_tokens()
    tokens[token] = {
        "email": req.email,
        "expires": (datetime.utcnow() + timedelta(hours=24)).isoformat(),
    }
    _save_tokens(tokens)

    link = f"{settings.magic_link_base_url}/login?token={token}"
    _send_magic_email(req.email, link)
    logger.info("Magic link issued for %s", req.email)
    return {"detail": "Magic link sent"}


@router.get("/verify/{token}")
async def verify_magic_link(token: str):
    tokens = _load_tokens()
    record = tokens.pop(token, None)

    if not record:
        raise HTTPException(status_code=401, detail="Link expired or invalid")

    expires_str = record.get("expires", "")
    if datetime.utcnow().isoformat() > expires_str:
        # Already expired — save without the token and reject
        _save_tokens(tokens)
        raise HTTPException(status_code=401, detail="Link expired or invalid")

    # Valid — remove from store (single-use) and issue JWT
    _save_tokens(tokens)

    jwt_token = jwt.encode(
        {
            "sub": record["email"],
            "exp": datetime.utcnow() + timedelta(days=settings.jwt_expire_days),
        },
        settings.secret_key,
        algorithm=settings.jwt_algorithm,
    )
    logger.info("Magic link verified for %s — JWT issued", record["email"])
    return {"access_token": jwt_token, "token_type": "bearer"}


def _send_magic_email(to_email: str, link: str) -> None:
    creds = Credentials.from_authorized_user_file(GMAIL_TOKEN_PATH)
    if creds.expired and creds.refresh_token:
        creds.refresh(Request())

    html = f"""
    <html><body style="background:#0C0A0F;color:#EDE8DE;font-family:Georgia,serif;padding:40px;">
    <p style="font-size:32px;color:#C9A87C;font-style:italic;margin-bottom:8px;">REVERIE</p>
    <p style="color:#9E9080;font-size:12px;letter-spacing:3px;text-transform:uppercase;margin-bottom:40px;">
      Dreams2Memories Travel
    </p>
    <p style="font-size:18px;margin-bottom:24px;">Your voyage is waiting.</p>
    <a href="{link}" style="
      display:inline-block;padding:16px 32px;
      border:1px solid #C9A87C;color:#C9A87C;
      text-decoration:none;font-size:13px;letter-spacing:3px;text-transform:uppercase;
    ">Open my voyage</a>
    <p style="color:#5A5050;font-size:11px;margin-top:40px;">
      This link is private and expires in 24 hours. No password required.
    </p>
    </body></html>
    """

    msg = MIMEMultipart("alternative")
    msg["Subject"] = "Your REVERIE access link"
    msg["From"] = "concierge@d2mluxury.quest"
    msg["To"] = to_email
    msg.attach(MIMEText(html, "html"))

    raw = base64.urlsafe_b64encode(msg.as_bytes()).decode()
    service = build("gmail", "v1", credentials=creds)
    service.users().messages().send(userId="me", body={"raw": raw}).execute()
