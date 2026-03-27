"""Shared auth helpers — JWT extraction from request headers."""

from fastapi import HTTPException, Request
from jose import jwt, JWTError

from app.core.config import settings


def get_email(request: Request) -> str:
    """Extract authenticated email from Bearer token."""
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing authorization header")
    try:
        payload = jwt.decode(auth[7:], settings.secret_key, algorithms=[settings.jwt_algorithm])
        return payload.get("sub", "")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
