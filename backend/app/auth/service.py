import os
import threading
import time

from collections import defaultdict, deque

from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session as DBSession

from app.models import User, Session

from app.auth.security import (
    generate_session_token,
    hash_session_token,
    get_session_expiration,
    verify_password,
)


# ============================================================
# Configuration
# ============================================================

AUTH_USERNAME = os.getenv(
    "AUTH_USERNAME"
)

AUTH_PASSWORD_HASH = os.getenv(
    "AUTH_PASSWORD_HASH"
)

SESSION_REFRESH_SECONDS = int(
    os.getenv(
        "AUTH_SESSION_REFRESH_SECONDS",
        "3600"
    )
)


# ============================================================
# Login Rate Limiting
# ============================================================

class LoginRateLimiter:

    def __init__(
        self,
        max_attempts: int = 5,
        window_seconds: int = 300
    ):

        self.max_attempts = max_attempts
        self.window_seconds = window_seconds

        self._attempts = defaultdict(
            deque
        )

        self._lock = threading.Lock()


    def is_allowed(
        self,
        key: str
    ) -> bool:

        now = time.monotonic()

        with self._lock:

            attempts = self._attempts[key]

            while (
                attempts
                and now - attempts[0]
                > self.window_seconds
            ):

                attempts.popleft()

            return (
                len(attempts)
                < self.max_attempts
            )


    def record_failure(
        self,
        key: str
    ) -> None:

        now = time.monotonic()

        with self._lock:

            attempts = self._attempts[key]

            while (
                attempts
                and now - attempts[0]
                > self.window_seconds
            ):

                attempts.popleft()

            attempts.append(
                now
            )


    def clear(
        self,
        key: str
    ) -> None:

        with self._lock:

            self._attempts.pop(
                key,
                None
            )


login_rate_limiter = LoginRateLimiter()


# ============================================================
# Default User
# ============================================================

def ensure_default_user(
    db: DBSession
) -> None:

    if not AUTH_USERNAME:
        raise RuntimeError(
            "AUTH_USERNAME is not configured."
        )

    if not AUTH_PASSWORD_HASH:
        raise RuntimeError(
            "AUTH_PASSWORD_HASH is not configured."
        )

    users = (
        db.query(User)
        .order_by(User.id.asc())
        .all()
    )

    if not users:

        user = User(
            username=AUTH_USERNAME,
            password_hash=AUTH_PASSWORD_HASH
        )

        db.add(user)

        db.commit()

        return

    user = users[0]

    if user.username != AUTH_USERNAME:

        raise RuntimeError(
            "Existing authentication username "
            "does not match AUTH_USERNAME."
        )


# ============================================================
# Authentication
# ============================================================

def authenticate_user(
    db: DBSession,
    username: str,
    password: str
) -> User | None:

    user = (
        db.query(User)
        .filter(
            User.username == username
        )
        .first()
    )

    if user is None:

        return None

    if not verify_password(
        password,
        user.password_hash
    ):

        return None

    return user


# ============================================================
# Session Creation
# ============================================================

def create_session(
    db: DBSession,
    user: User
) -> str:

    now = datetime.now(
        timezone.utc
    )

    token = generate_session_token()

    session = Session(

        user_id=user.id,

        token_hash=hash_session_token(
            token
        ),

        created_at=now,

        last_seen_at=now,

        expires_at=get_session_expiration(
            now
        )

    )

    db.add(session)

    db.commit()

    return token


# ============================================================
# Session Lookup
# ============================================================

def get_session(
    db: DBSession,
    token: str | None
) -> Session | None:

    if not token:

        return None

    token_hash = hash_session_token(
        token
    )

    session = (
        db.query(Session)
        .filter(
            Session.token_hash
            == token_hash
        )
        .first()
    )

    if session is None:

        return None

    now = datetime.now(
        timezone.utc
    )

    if session.expires_at <= now:

        db.delete(session)

        db.commit()

        return None

    return session


# ============================================================
# Session Activity / Sliding Expiration
# ============================================================

def refresh_session_if_needed(
    db: DBSession,
    session: Session
) -> bool:

    now = datetime.now(
        timezone.utc
    )

    refresh_after = (
        session.last_seen_at
        + timedelta(
            seconds=SESSION_REFRESH_SECONDS
        )
    )

    if now < refresh_after:

        return False

    session.last_seen_at = now

    session.expires_at = (
        get_session_expiration(
            now
        )
    )

    db.commit()

    return True


# ============================================================
# Session Deletion
# ============================================================

def delete_session(
    db: DBSession,
    token: str | None
) -> None:

    if not token:

        return

    token_hash = hash_session_token(
        token
    )

    session = (
        db.query(Session)
        .filter(
            Session.token_hash
            == token_hash
        )
        .first()
    )

    if session:

        db.delete(session)

        db.commit()
