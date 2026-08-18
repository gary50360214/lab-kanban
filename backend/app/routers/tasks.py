from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.websocket import manager
from app.database import SessionLocal
from app.models import Project, Task
from app.schemas import (
    TaskCreate,
    TaskUpdate,
    TaskResponse,
)


router = APIRouter(
    prefix="/api",
    tags=["tasks"]
)


def get_db():

    db = SessionLocal()

    try:

        yield db

    finally:

        db.close()


# ============================================================
# Task -> JSON-safe response
# ============================================================

def task_to_response(
    task: Task
) -> dict:

    return {
        "id": task.id,

        "project_id": task.project_id,

        "name": task.name,

        "owner": task.owner,

        "status": task.status,

        "priority": task.priority,

        "start": (
            task.start.isoformat()
            if task.start
            else None
        ),

        "end": (
            task.end.isoformat()
            if task.end
            else None
        ),

        "description": task.description,

        "progress": task.progress,

        "checklist": [

            {
                "id": item.id,

                "text": item.text,

                "completed": bool(
                    item.completed
                ),

            }

            for item in task.checklist

        ],

    }


# ============================================================
# Get tasks of a project
# ============================================================

@router.get(
    "/projects/{project_id}/tasks",
    response_model=list[TaskResponse]
)
def get_project_tasks(
    project_id: int,
    db: Session = Depends(get_db)
):

    project = (
        db.query(Project)
        .filter(Project.id == project_id)
        .first()
    )

    if not project:

        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )

    return [
        task_to_response(task)
        for task in project.tasks
    ]


# ============================================================
# Get single task
# ============================================================

@router.get(
    "/tasks/{task_id}",
    response_model=TaskResponse
)
def get_task(
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

    return task_to_response(task)


# ============================================================
# Create task
# ============================================================

@router.post(
    "/projects/{project_id}/tasks",
    response_model=TaskResponse
)
async def create_task(
    project_id: int,
    data: TaskCreate,
    db: Session = Depends(get_db)
):

    project = (
        db.query(Project)
        .filter(Project.id == project_id)
        .first()
    )

    if not project:

        raise HTTPException(
            status_code=404,
            detail="Project not found"
        )


    if not data.name.strip():

        raise HTTPException(
            status_code=400,
            detail="Task name is required"
        )


    if (
        data.start
        and data.end
        and data.end < data.start
    ):

        raise HTTPException(
            status_code=400,
            detail="End date cannot be earlier than start date"
        )


    if data.progress < 0 or data.progress > 100:

        raise HTTPException(
            status_code=400,
            detail="Progress must be between 0 and 100"
        )


    task = Task(

        project_id=project_id,

        name=data.name.strip(),

        owner=data.owner,

        status=data.status,

        priority=data.priority,

        start=data.start,

        end=data.end,

        description=data.description,

        progress=data.progress,

    )


    db.add(task)

    db.commit()

    db.refresh(task)


    result = task_to_response(
        task
    )


    await manager.broadcast({

        "type": "task.created",

        "project_id": task.project_id,

        "data": result

    })


    return result


# ============================================================
# Update task
# ============================================================

@router.put(
    "/tasks/{task_id}",
    response_model=TaskResponse
)
async def update_task(
    task_id: int,
    data: TaskUpdate,
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


    # --------------------------------------------------------
    # Name
    # --------------------------------------------------------

    if data.name is not None:

        if not data.name.strip():

            raise HTTPException(
                status_code=400,
                detail="Task name is required"
            )

        task.name = data.name.strip()


    # --------------------------------------------------------
    # Owner
    # --------------------------------------------------------

    if data.owner is not None:

        task.owner = data.owner


    # --------------------------------------------------------
    # Status
    # --------------------------------------------------------

    if data.status is not None:

        task.status = data.status


    # --------------------------------------------------------
    # Priority
    # --------------------------------------------------------

    if data.priority is not None:

        task.priority = data.priority


    # --------------------------------------------------------
    # Start
    # --------------------------------------------------------

    if data.start is not None:

        task.start = data.start


    # --------------------------------------------------------
    # End
    # --------------------------------------------------------

    if data.end is not None:

        task.end = data.end


    if (
        task.start
        and task.end
        and task.end < task.start
    ):

        raise HTTPException(
            status_code=400,
            detail="End date cannot be earlier than start date"
        )


    # --------------------------------------------------------
    # Description
    # --------------------------------------------------------

    if data.description is not None:

        task.description = data.description


    # --------------------------------------------------------
    # Progress
    # --------------------------------------------------------

    if data.progress is not None:

        if (
            data.progress < 0
            or data.progress > 100
        ):

            raise HTTPException(
                status_code=400,
                detail="Progress must be between 0 and 100"
            )

        task.progress = data.progress


    db.commit()

    db.refresh(task)


    result = task_to_response(
        task
    )


    await manager.broadcast({

        "type": "task.updated",

        "project_id": task.project_id,

        "data": result

    })


    return result


# ============================================================
# Delete task
# ============================================================

@router.delete(
    "/tasks/{task_id}"
)
async def delete_task(
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


    project_id = task.project_id


    db.delete(task)

    db.commit()


    await manager.broadcast({

        "type": "task.deleted",

        "project_id": project_id,

        "data": {
            "id": task_id
        }

    })


    return {
        "message": "Task deleted"
    }