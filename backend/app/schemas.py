from datetime import date

from pydantic import BaseModel, ConfigDict

# ============================================================
# Owner
# ============================================================

class OwnerCreate(BaseModel):

    name: str


class OwnerUpdate(BaseModel):

    name: str


class OwnerResponse(BaseModel):

    id: int
    name: str

    model_config = ConfigDict(
        from_attributes=True
    )
# ============================================================
# Project
# ============================================================

class ProjectCreate(BaseModel):
    name: str


class ProjectUpdate(BaseModel):
    name: str


class ProjectResponse(BaseModel):
    id: int
    name: str

    model_config = ConfigDict(
        from_attributes=True
    )


# ============================================================
# Checklist
# ============================================================

class ChecklistCreate(BaseModel):
    text: str
    completed: bool = False


class ChecklistUpdate(BaseModel):
    text: str
    completed: bool


class ChecklistResponse(BaseModel):
    id: int
    text: str
    completed: bool

    model_config = ConfigDict(
        from_attributes=True
    )


# ============================================================
# Task
# ============================================================

class TaskCreate(BaseModel):
    name: str
    owner: str | None = None
    status: str = "todo"
    priority: str = "不緊急也不重要"

    start: date | None = None
    end: date | None = None

    description: str | None = None
    progress: int = 0


class TaskUpdate(BaseModel):
    name: str | None = None
    owner: str | None = None
    status: str | None = None
    priority: str | None = None

    start: date | None = None
    end: date | None = None

    description: str | None = None
    progress: int | None = None


class TaskResponse(BaseModel):
    id: int
    project_id: int

    name: str
    owner: str | None = None
    status: str
    priority: str

    start: date | None = None
    end: date | None = None

    description: str | None = None
    progress: int

    checklist: list[ChecklistResponse] = []

    model_config = ConfigDict(
        from_attributes=True
    )

# ============================================================
# Template Checklist
# ============================================================

class TemplateChecklistCreate(BaseModel):

    text: str

class TemplateChecklistUpdate(BaseModel):

    text: str

class TemplateChecklistResponse(BaseModel):

    id: int
    text: str

    model_config = ConfigDict(
        from_attributes=True
    )


# ============================================================
# Template
# ============================================================

class TemplateCreate(BaseModel):

    name: str

    owner: str | None = None

    status: str = "todo"

    priority: str = "不緊急也不重要"

    start: date | None = None

    end: date | None = None

    description: str | None = None

    checklist: list[TemplateChecklistCreate] = []


class TemplateUpdate(BaseModel):

    name: str | None = None

    owner: str | None = None

    status: str | None = None

    priority: str | None = None

    start: date | None = None

    end: date | None = None

    description: str | None = None

    checklist: list[TemplateChecklistCreate] | None = None


class TemplateResponse(BaseModel):

    id: int

    name: str

    owner: str | None = None

    status: str

    priority: str

    start: date | None = None

    end: date | None = None

    description: str | None = None

    checklist: list[TemplateChecklistResponse] = []

    model_config = ConfigDict(
        from_attributes=True
    )
# ============================================================
# Authentication
# ============================================================

class LoginRequest(BaseModel):

    username: str

    password: str


class AuthResponse(BaseModel):

    authenticated: bool
    username: str | None = None