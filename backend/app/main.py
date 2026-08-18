from fastapi import (
    FastAPI,
    WebSocket,
    WebSocketDisconnect,
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
from app.websocket import manager


app = FastAPI(

    title="ND2A33 Backend",

    description="Internal Department Tool API"

)


# ============================================================
# Routers
# ============================================================

app.include_router(
    owners_router
)

app.include_router(
    projects_router
)

app.include_router(
    tasks_router
)

app.include_router(
    checklists_router
)

app.include_router(
    templates_router
)
# ============================================================
# WebSocket
# ============================================================

@app.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket
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