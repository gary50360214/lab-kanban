import logging

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Request,
    Response,
    status,
)

from sqlalchemy.orm import Session as DBSession

from app.database import get_db

from app.models import User

from app.schemas import (
    AuthResponse,
    LoginRequest,
)

from app.auth.security import (
    COOKIE_NAME,
    get_session_expiration,
)

from app.auth.service import (
    authenticate_user,
    create_session,
    delete_session,
    get_session,
    login_rate_limiter,
)

from app.auth.dependencies import (
    clear_session_cookie,
    set_session_cookie,
    verify_same_origin,
)


logger = logging.getLogger(
    "nd2a33.auth"
)


router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"]
)


# ============================================================
# Login
# ============================================================

@router.post(
    "/login",
    response_model=AuthResponse
)
def login(
    request: Request,
    response: Response,
    payload: LoginRequest,
    db: DBSession = Depends(get_db)
):

    verify_same_origin(
        request
    )

    username = payload.username.strip()

    if not username or not payload.password:

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )

    if (
        len(username) > 128
        or len(payload.password) > 256
    ):

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )

    client_ip = (
        request.client.host
        if request.client
        else "unknown"
    )

    ip_key = f"ip:{client_ip}"

    user_key = (
        f"user:{username.lower()}"
    )

    if not login_rate_limiter.is_allowed(
        ip_key
    ):

        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many login attempts"
        )

    if not login_rate_limiter.is_allowed(
        user_key
    ):

        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many login attempts"
        )

    user = authenticate_user(
        db,
        username,
        payload.password
    )

    if user is None:

        login_rate_limiter.record_failure(
            ip_key
        )

        login_rate_limiter.record_failure(
            user_key
        )

        logger.warning(
            "Authentication failure for username=%s from ip=%s",
            username,
            client_ip
        )

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )

    login_rate_limiter.clear(
        ip_key
    )

    login_rate_limiter.clear(
        user_key
    )

    token = create_session(
        db,
        user
    )

    session = get_session(
        db,
        token
    )

    if session is None:

        raise HTTPException(
            status_code=500,
            detail="Authentication service error"
        )

    set_session_cookie(
        response,
        token,
        session.expires_at
    )

    logger.info(
        "Authentication success for username=%s from ip=%s",
        user.username,
        client_ip
    )

    return AuthResponse(
        authenticated=True,
        username=user.username
    )


# ============================================================
# Current Authentication
# ============================================================

@router.get(
    "/me",
    response_model=AuthResponse
)
def me(
    response: Response,
    request: Request,
    db: DBSession = Depends(get_db)
):

    from app.auth.dependencies import get_current_user

    user = get_current_user(
        request=request,
        response=response,
        db=db
    )

    return AuthResponse(
        authenticated=True,
        username=user.username
    )


# ============================================================
# Logout
# ============================================================

@router.post(
    "/logout"
)
def logout(
    request: Request,
    response: Response,
    db: DBSession = Depends(get_db)
):

    verify_same_origin(
        request
    )

    token = request.cookies.get(
        COOKIE_NAME
    )

    delete_session(
        db,
        token
    )

    clear_session_cookie(
        response
    )

    response.headers[
        "Clear-Site-Data"
    ] = '"cache", "cookies"'

    return {
        "success": True
    }
