from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import SessionLocal

from app.models import (
    Template,
    TemplateChecklist
)

from app.schemas import (
    TemplateCreate,
    TemplateUpdate,
    TemplateResponse
)

from app.websocket import manager


router = APIRouter(
    prefix="/api/templates",
    tags=["templates"]
)


def get_db():

    db = SessionLocal()

    try:

        yield db

    finally:

        db.close()


# ============================================================
# Get all templates
# ============================================================

@router.get(
    "",
    response_model=list[TemplateResponse]
)
def get_templates(
    db: Session = Depends(get_db)
):

    return (
        db.query(Template)
        .order_by(Template.id)
        .all()
    )


# ============================================================
# Get template
# ============================================================

@router.get(
    "/{template_id}",
    response_model=TemplateResponse
)
def get_template(
    template_id: int,
    db: Session = Depends(get_db)
):

    template = (
        db.query(Template)
        .filter(
            Template.id == template_id
        )
        .first()
    )

    if not template:

        raise HTTPException(
            status_code=404,
            detail="Template not found"
        )

    return template


# ============================================================
# Create template
# ============================================================

@router.post(
    "",
    response_model=TemplateResponse
)
async def create_template(
    data: TemplateCreate,
    db: Session = Depends(get_db)
):

    name = data.name.strip()

    if not name:

        raise HTTPException(
            status_code=400,
            detail="Template name is required"
        )


    template = Template(

        name=name,

        owner=data.owner,

        status=data.status,

        priority=data.priority,

        start=data.start,

        end=data.end,

        description=data.description

    )


    db.add(template)

    db.flush()


    # --------------------------------------------------------
    # Checklist
    # --------------------------------------------------------

    for item in data.checklist:

        checklist = TemplateChecklist(

            template_id=template.id,

            text=item.text,

            completed=0

        )

        db.add(checklist)


    db.commit()

    db.refresh(template)


    # --------------------------------------------------------
    # WebSocket
    #
    # SQLAlchemy ORM object 不能直接送進 send_json()
    # 先轉成 Pydantic / JSON-safe data。
    # --------------------------------------------------------

    template_data = (

        TemplateResponse
        .model_validate(template)
        .model_dump(mode="json")

    )


    await manager.broadcast({

        "type":
            "template.created",

        "data":
            template_data

    })


    return template


# ============================================================
# Update template
# ============================================================

@router.put(
    "/{template_id}",
    response_model=TemplateResponse
)
async def update_template(
    template_id: int,
    data: TemplateUpdate,
    db: Session = Depends(get_db)
):

    template = (
        db.query(Template)
        .filter(
            Template.id == template_id
        )
        .first()
    )


    if not template:

        raise HTTPException(
            status_code=404,
            detail="Template not found"
        )


    if data.name is not None:

        name = data.name.strip()

        if not name:

            raise HTTPException(
                status_code=400,
                detail="Template name is required"
            )

        template.name = name


    if data.owner is not None:

        template.owner = data.owner


    if data.status is not None:

        template.status = data.status


    if data.priority is not None:

        template.priority = data.priority



        template.start = data.start

        template.end = data.end


    if data.description is not None:

        template.description = data.description


    # --------------------------------------------------------
    # Replace checklist
    # --------------------------------------------------------

    if data.checklist is not None:

        template.checklist.clear()


        for item in data.checklist:

            checklist = TemplateChecklist(

                text=item.text,

                completed=0

            )

            template.checklist.append(
                checklist
            )


    db.commit()

    db.refresh(template)


    # --------------------------------------------------------
    # WebSocket
    #
    # SQLAlchemy ORM object 不能直接送進 send_json()
    # 轉成 JSON-safe data。
    # --------------------------------------------------------

    template_data = (

        TemplateResponse
        .model_validate(template)
        .model_dump(mode="json")

    )


    await manager.broadcast({

        "type":
            "template.updated",

        "data":
            template_data

    })


    return template


# ============================================================
# Delete template
# ============================================================

@router.delete(
    "/{template_id}"
)
async def delete_template(
    template_id: int,
    db: Session = Depends(get_db)
):

    template = (
        db.query(Template)
        .filter(
            Template.id == template_id
        )
        .first()
    )


    if not template:

        raise HTTPException(
            status_code=404,
            detail="Template not found"
        )


    # --------------------------------------------------------
    # WebSocket data
    #
    # Delete 不需要整個 Template。
    # 只需要通知其他 client 哪一個 ID 被刪除。
    # --------------------------------------------------------

    template_data = {

        "id":
            template.id

    }


    db.delete(template)

    db.commit()


    await manager.broadcast({

        "type":
            "template.deleted",

        "data":
            template_data

    })


    return {

        "message":
            "Template deleted"

    }