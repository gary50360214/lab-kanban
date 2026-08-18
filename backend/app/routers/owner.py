from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import Owner
from app.schemas import (
    OwnerCreate,
    OwnerUpdate,
    OwnerResponse,
)

from app.websocket import manager


router = APIRouter(
    prefix="/api",
    tags=["owners"]
)


def get_db():

    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()


# ============================================================
# Get all owners
# ============================================================

@router.get(
    "/owners",
    response_model=list[OwnerResponse]
)
def get_owners(
    db: Session = Depends(get_db)
):

    return (
        db.query(Owner)
        .order_by(Owner.id)
        .all()
    )


# ============================================================
# Create owner
# ============================================================

@router.post(
    "/owners",
    response_model=OwnerResponse
)
async def create_owner(
    data: OwnerCreate,
    db: Session = Depends(get_db)
):

    name = data.name.strip()

    if not name:

        raise HTTPException(
            status_code=400,
            detail="Owner name is required"
        )

    existing = (
        db.query(Owner)
        .filter(Owner.name == name)
        .first()
    )

    if existing:

        raise HTTPException(
            status_code=409,
            detail="Owner already exists"
        )

    owner = Owner(
        name=name
    )

    db.add(owner)

    db.commit()

    db.refresh(owner)


    # ---------------------------------------------------------
    # Realtime broadcast
    # ---------------------------------------------------------

    await manager.broadcast({

        "type": "owner.created",

        "data": {
            "id": owner.id,
            "name": owner.name
        }

    })


    return owner


# ============================================================
# Update owner
# ============================================================

@router.put(
    "/owners/{owner_id}",
    response_model=OwnerResponse
)
def update_owner(
    owner_id: int,
    data: OwnerUpdate,
    db: Session = Depends(get_db)
):

    owner = (
        db.query(Owner)
        .filter(Owner.id == owner_id)
        .first()
    )

    if not owner:

        raise HTTPException(
            status_code=404,
            detail="Owner not found"
        )

    name = data.name.strip()

    if not name:

        raise HTTPException(
            status_code=400,
            detail="Owner name is required"
        )

    existing = (
        db.query(Owner)
        .filter(
            Owner.name == name,
            Owner.id != owner_id
        )
        .first()
    )

    if existing:

        raise HTTPException(
            status_code=409,
            detail="Owner already exists"
        )

    owner.name = name

    db.commit()

    db.refresh(owner)

    return owner


# ============================================================
# Delete owner
# ============================================================

@router.delete(
    "/owners/{owner_id}"
)
async def delete_owner(
    owner_id: int,
    db: Session = Depends(get_db)
):

    owner = (
        db.query(Owner)
        .filter(Owner.id == owner_id)
        .first()
    )

    if not owner:

        raise HTTPException(
            status_code=404,
            detail="Owner not found"
        )


    # ---------------------------------------------------------
    # Save ID before deleting ORM object
    # ---------------------------------------------------------

    deleted_owner_id = owner.id


    db.delete(owner)

    db.commit()


    # ---------------------------------------------------------
    # Realtime broadcast
    # ---------------------------------------------------------

    await manager.broadcast({

        "type": "owner.deleted",

        "data": {
            "id": deleted_owner_id
        }

    })


    return {
        "message": "Owner deleted"
    }