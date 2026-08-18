from typing import Any

from fastapi.encoders import jsonable_encoder

from .manager import manager


async def publish_event(
    event_type: str,
    data: Any = None,
    *,
    entity: str | None = None,
    action: str | None = None,
    project_id: int | None = None,
    task_id: int | None = None,
):
    """
    Publish a standardized WebSocket event.

    This function is the single entry point for
    application-level realtime events.

    Responsibilities:
    - Standardize event format
    - Convert Python objects such as date/datetime
      into JSON-safe values
    - Broadcast through ConnectionManager

    Example:

        await publish_event(
            "task.created",
            task_data,
            project_id=1,
            task_id=16,
        )
    """

    if entity is None:

        entity = (
            event_type.split(".", 1)[0]
            if "." in event_type
            else event_type
        )


    if action is None:

        action = (
            event_type.split(".", 1)[1]
            if "." in event_type
            else "updated"
        )


    message = {
        "type": event_type,
        "entity": entity,
        "action": action,
    }


    if project_id is not None:

        message["project_id"] = project_id


    if task_id is not None:

        message["task_id"] = task_id


    if data is not None:

        message["data"] = jsonable_encoder(
            data
        )

    else:

        message["data"] = None


    await manager.broadcast(
        message
    )
