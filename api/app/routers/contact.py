"""Contact endpoint — POST /api/contact sends message to concierge."""

import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from fastapi import APIRouter, HTTPException
from jose import jwt, JWTError
from pydantic import BaseModel

from app.core.config import settings

router = APIRouter()


class ContactRequest(BaseModel):
    message: str


class ContactResponse(BaseModel):
    detail: str


def _send_contact_email(client_email: str, message: str) -> None:
    """Send contact message to d2mconcierge via SMTP."""
    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"REVERIE Client Message — {client_email}"
    msg["From"] = settings.smtp_user
    msg["To"] = "d2mconcierge@gmail.com"

    text = f"""Message from REVERIE client {client_email}:

{message}
"""

    msg.attach(MIMEText(text, "plain"))

    with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as server:
        server.starttls()
        server.login(settings.smtp_user, settings.smtp_password)
        server.sendmail(settings.smtp_user, "d2mconcierge@gmail.com", msg.as_string())


@router.post("", response_model=ContactResponse)
async def send_contact_message(
    req: ContactRequest,
    authorization: str | None = None,
):
    """
    Send a message to Dani (d2mconcierge@gmail.com).
    Requires valid JWT in Authorization header (Bearer token).
    """
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing authorization header")

    # Extract Bearer token
    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(status_code=401, detail="Invalid authorization header format")

    token = parts[1]

    # Decode JWT
    try:
        payload = jwt.decode(
            token,
            settings.secret_key,
            algorithms=[settings.jwt_algorithm],
        )
        client_email = payload.get("sub")
        if not client_email:
            raise HTTPException(status_code=401, detail="Invalid token payload")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    # Send email
    try:
        _send_contact_email(client_email, req.message)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send message: {str(e)}")

    return ContactResponse(detail="Message received. Dani will follow up shortly.")
