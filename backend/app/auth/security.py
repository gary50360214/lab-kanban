import hashlib
import os
import secrets

from datetime import datetime, timedelta, timezone

from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError


# ============================================================
# Configuration
# ============================================================

SESSION_IDLE_DAYS = int(
    os.getenv(
        "AUTH_SESSION_IDLE_DAYS",
        "30"
    )
)

SESSION_REFRESH_SECONDS = int(
    os.getenv(
        "AUTH_SESSION_REFRESH_SECONDS",
        "3600"
    )
)

COOKIE_NAME = os.getenv(
    "AUTH_COOKIE_NAME",
    "nd2a33_session"
)

COOKIE_SECURE = (
    os.getenv(
        "AUTH_COOKIE_SECURE",
        "false"
    ).lower()
    == "true"
)


# ============================================================
# Password Hashing
# ============================================================

password_hasher = PasswordHasher()


def hash_password(
    password: str
) -> str:

    return password_hasher.hash(
        password
    )


def verify_password(
    password: str,
    password_hash: str
) -> bool:

    try:

        return password_hasher.verify(
            password_hash,
            password
        )

    except VerifyMismatchError:

        return False

    except Exception:

        return False


# ============================================================
# Session Token
# ============================================================

def generate_session_token() -> str:

    return secrets.token_urlsafe(
        32
    )


def hash_session_token(
    token: str
) -> str:

    return hashlib.sha256(
        token.encode("utf-8")
    ).hexdigest()


# ============================================================
# Session Expiration
# ============================================================

def get_session_expiration(
    now: datetime | None = None
) -> datetime:

    if now is None:

        now = datetime.now(
            timezone.utc
        )

    return (
        now
        + timedelta(
            days=SESSION_IDLE_DAYS
        )
    )
