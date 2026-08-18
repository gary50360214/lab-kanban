from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.websocket import manager
from app.database import SessionLocal
from app.models import Task, TaskChecklist
from app.schemas import (
    ChecklistCreate,
    ChecklistUpdate,
    ChecklistResponse,
)


router = APIRouter(
    prefix="/api",
    tags=["checklists"]
)


def get_db():

    db = SessionLocal()

    try:

        yield db

    finally:

        db.close()


# ============================================================
# Checklist -> response
# ============================================================

def checklist_to_response(
    item: TaskChecklist
) -> dict:

    return {

        "id": item.id,

        "task_id": item.task_id,

        "text": item.text,

        "completed": bool(
            item.completed
        ),

    }


# ============================================================
# Get checklist
# ============================================================

@router.get(
    "/tasks/{task_id}/checklist",
    response_model=list[ChecklistResponse]
)
def get_checklist(
    task_id: int,
    db: Session = Depends(get_db)
):

    task = (
        db.query(Task)
        .filter(Task.id == task_id)
        .first()
    )

    if not task:

        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )

    return task.checklist


# ============================================================
# Create checklist
# ============================================================

@router.post(
    "/tasks/{task_id}/checklist",
    response_model=ChecklistResponse
)
async def create_checklist(
    task_id: int,
    data: ChecklistCreate,
    db: Session = Depends(get_db)
):

    task = (
        db.query(Task)
        .filter(Task.id == task_id)
        .first()
    )

    if not task:

        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )


    if not data.text.strip():

        raise HTTPException(
            status_code=400,
            detail="Checklist text is required"
        )


    item = TaskChecklist(

        task_id=task_id,

        text=data.text.strip(),

        completed=int(
            data.completed
        )

    )


    db.add(item)

    db.commit()

    db.refresh(item)


    result = checklist_to_response(
        item
    )


    await manager.broadcast({

        "type": "checklist.created",

        "project_id": task.project_id,

        "task_id": task_id,

        "data": result

    })


    return result


# ============================================================
# Update checklist
# ============================================================

@router.put(
    "/tasks/{task_id}/checklist/{item_id}",
    response_model=ChecklistResponse
)
async def update_checklist(
    task_id: int,
    item_id: int,
    data: ChecklistUpdate,
    db: Session = Depends(get_db)
):

    item = (
        db.query(TaskChecklist)
        .filter(
            TaskChecklist.id == item_id,
            TaskChecklist.task_id == task_id
        )
        .first()
    )

    if not item:

        raise HTTPException(
            status_code=404,
            detail="Checklist item not found"
        )


    if not data.text.strip():

        raise HTTPException(
            status_code=400,
            detail="Checklist text is required"
        )


    item.text = data.text.strip()

    item.completed = int(
        data.completed
    )


    db.commit()

    db.refresh(item)


    result = checklist_to_response(
        item
    )


    task = (
        db.query(Task)
        .filter(Task.id == task_id)
        .first()
    )


    if task:

        await manager.broadcast({

            "type": "checklist.updated",

            "project_id": task.project_id,

            "task_id": task_id,

            "data": result

        })


    return result


# ============================================================
# Delete checklist
# ============================================================

@router.delete(
    "/tasks/{task_id}/checklist/{item_id}"
)
async def delete_checklist(
    task_id: int,
    item_id: int,
    db: Session = Depends(get_db)
):

    item = (
        db.query(TaskChecklist)
        .filter(
            TaskChecklist.id == item_id,
            TaskChecklist.task_id == task_id
        )
        .first()
    )

    if not item:

        raise HTTPException(
            status_code=404,
            detail="Checklist item not found"
        )


    task = (
        db.query(Task)
        .filter(Task.id == task_id)
        .first()
    )


    project_id = (
        task.project_id
        if task
        else None
    )


    deleted_id = item.id


    db.delete(item)

    db.commit()


    await manager.broadcast({

        "type": "checklist.deleted",

        "project_id": project_id,

        "task_id": task_id,

        "data": {

            "id": deleted_id

        }

    })


    return {

        "message": "Checklist item deleted"

    }