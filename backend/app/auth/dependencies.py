from datetime import datetime, timezone

from fastapi import (
    Depends,
    HTTPException,
    Request,
    Response,
    WebSocket,
    WebSocketException,
    status,
)

from sqlalchemy.orm import Session as DBSession

from app.database import get_db

from app.models import User

from app.auth.security import (
    COOKIE_NAME,
    COOKIE_SECURE,
    SESSION_IDLE_DAYS,
)

from app.auth.service import (
    get_session,
    refresh_session_if_needed,
)


# ============================================================
# Cookie Configuration
# ============================================================

def set_session_cookie(
    response: Response,
    token: str,
    expires_at: datetime
) -> None:

    max_age = max(
        0,
        int(
            (
                expires_at
                - datetime.now(
                    timezone.utc
                )
            ).total_seconds()
        )
    )

    response.set_cookie(

        key=COOKIE_NAME,

        value=token,

        max_age=max_age,

        expires=max_age,

        httponly=True,

        secure=COOKIE_SECURE,

        samesite="lax",

        path="/"
    )


def clear_session_cookie(
    response: Response
) -> None:

    response.delete_cookie(
        key=COOKIE_NAME,
        path="/"
    )


# ============================================================
# Same-Origin Protection
# ============================================================

def verify_same_origin(
    request: Request
) -> None:

    if request.method.upper() in {
        "GET",
        "HEAD",
        "OPTIONS"
    }:

        return

    origin = request.headers.get(
        "origin"
    )

    if not origin:

        return

    forwarded_proto = (
        request.headers.get(
            "x-forwarded-proto"
        )
        or request.url.scheme
    )

    forwarded_host = (
        request.headers.get(
            "x-forwarded-host"
        )
        or request.headers.get(
            "host"
        )
    )

    expected_origin = (
        f"{forwarded_proto}://"
        f"{forwarded_host}"
    )

    if origin != expected_origin:

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden"
        )


# ============================================================
# Current User
# ============================================================

def get_current_user(
    request: Request,
    response: Response,
    db: DBSession = Depends(get_db)
) -> User:

    verify_same_origin(
        request
    )

    token = request.cookies.get(
        COOKIE_NAME
    )

    session = get_session(
        db,
        token
    )

    if session is None:

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )

    user = (
        db.query(User)
        .filter(
            User.id == session.user_id
        )
        .first()
    )

    if user is None:

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )

    refreshed = refresh_session_if_needed(
        db,
        session
    )

    if refreshed:

        set_session_cookie(
            response,
            token,
            session.expires_at
        )

    return user


# ============================================================
# WebSocket Authentication
# ============================================================

def get_current_user_websocket(
    websocket: WebSocket,
    db: DBSession = Depends(get_db)
) -> User:

    token = websocket.cookies.get(
        COOKIE_NAME
    )

    session = get_session(
        db,
        token
    )

    if session is None:

        raise WebSocketException(
            code=1008
        )

    user = (
        db.query(User)
        .filter(
            User.id == session.user_id
        )
        .first()
    )

    if user is None:

        raise WebSocketException(
            code=1008
        )

    refresh_session_if_needed(
        db,
        session
    )

    return user
