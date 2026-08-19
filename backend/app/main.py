from fastapi import (
    FastAPI,
    WebSocket,
    WebSocketDisconnect,
    Depends,
)

from app.database import (
    SessionLocal,
)

from app.routers.projects import (
    router as projects_router
)

from app.routers.tasks import (
    router as tasks_router
)

from app.routers.checklists import (
    router as checklists_router
)

from app.routers.owner import (
    router as owners_router
)

from app.routers.templates import (
    router as templates_router
)

from app.auth.auth import (
    router as auth_router
)

from app.auth.dependencies import (
    get_current_user,
    get_current_user_websocket,
)

from app.auth.service import (
    ensure_default_user,
)

from app.websocket import manager


app = FastAPI(

    title="ND2A33 Backend",

    description="Internal Department Tool API"

)


# ============================================================
# Authentication Initialization
# ============================================================

@app.on_event("startup")
def initialize_authentication():

    db = SessionLocal()

    try:

        ensure_default_user(
            db
        )

    finally:

        db.close()


# ============================================================
# Public Authentication Router
# ============================================================

app.include_router(
    auth_router
)


# ============================================================
# Protected Routers
# ============================================================

app.include_router(
    owners_router,
    dependencies=[
        Depends(
            get_current_user
        )
    ]
)

app.include_router(
    projects_router,
    dependencies=[
        Depends(
            get_current_user
        )
    ]
)

app.include_router(
    tasks_router,
    dependencies=[
        Depends(
            get_current_user
        )
    ]
)

app.include_router(
    checklists_router,
    dependencies=[
        Depends(
            get_current_user
        )
    ]
)

app.include_router(
    templates_router,
    dependencies=[
        Depends(
            get_current_user
        )
    ]
)


# ============================================================
# WebSocket
# ============================================================

@app.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    current_user=Depends(
        get_current_user_websocket
    )
):

    await manager.connect(
        websocket
    )

    try:

        while True:

            await websocket.receive_text()

    except WebSocketDisconnect:

        manager.disconnect(
            websocket
        )

    except Exception as error:

        print(
            f"[WebSocket] Connection error: "
            f"{error}",
            flush=True
        )

        manager.disconnect(
            websocket
        )


# ============================================================
# Root
# ============================================================

@app.get("/")
def root():

    return {

        "message":
        "ND2A33 backend is running"

    }


# ============================================================
# Health
# ============================================================

@app.get("/health")
def health():

    return {

        "status": "OK"

    }