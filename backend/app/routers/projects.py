from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import Project
from app.schemas import (
    ProjectCreate,
    ProjectUpdate,
    ProjectResponse,
)

from app.websocket import manager


router = APIRouter(
    prefix="/api/projects",
    tags=["projects"]
)


def get_db():

    db = SessionLocal()

    try:

        yield db

    finally:

        db.close()


# =========================================================
# Get Projects
# =========================================================

@router.get(
    "",
    response_model=list[ProjectResponse]
)
def get_projects(
    db: Session = Depends(get_db)
):

    return db.query(Project).all()


# =========================================================
# Get Project
# =========================================================

@router.get(
    "/{project_id}",
    response_model=ProjectResponse
)
def get_project(
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

    return project


# =========================================================
# Create Project
# =========================================================

@router.post(
    "",
    response_model=ProjectResponse
)
async def create_project(
    data: ProjectCreate,
    db: Session = Depends(get_db)
):

    project = Project(
        name=data.name
    )

    db.add(project)

    db.commit()

    db.refresh(project)


    # -----------------------------------------------------
    # Realtime event
    # -----------------------------------------------------

    await manager.broadcast({

        "type":
            "project.created",

        "data": {

            "id":
                project.id,

            "name":
                project.name

        }

    })


    return project


# =========================================================
# Update Project
# =========================================================

@router.put(
    "/{project_id}",
    response_model=ProjectResponse
)
async def update_project(
    project_id: int,
    data: ProjectUpdate,
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


    project.name = data.name

    db.commit()

    db.refresh(project)


    # -----------------------------------------------------
    # Realtime event
    # -----------------------------------------------------

    await manager.broadcast({

        "type":
            "project.updated",

        "data": {

            "id":
                project.id,

            "name":
                project.name

        }

    })


    return project


# =========================================================
# Delete Project
# =========================================================

@router.delete(
    "/{project_id}"
)
async def delete_project(
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


    project_id_value = project.id


    db.delete(project)

    db.commit()


    # -----------------------------------------------------
    # Realtime event
    # -----------------------------------------------------

    await manager.broadcast({

        "type":
            "project.deleted",

        "data": {

            "id":
                project_id_value

        }

    })


    return {

        "message":
            "Project deleted"

    }