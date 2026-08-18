from sqlalchemy import Column, Integer, String, Text, Date, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base

class Owner(Base):
    __tablename__ = "owners"

    id = Column(
        Integer,
        primary_key=True
    )

    name = Column(
        String(255),
        nullable=False,
        unique=True
    )
class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)

    tasks = relationship(
        "Task",
        back_populates="project",
        cascade="all, delete-orphan"
    )


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True)
    project_id = Column(
        Integer,
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False
    )

    name = Column(String(255), nullable=False)
    owner = Column(String(255), nullable=True)
    status = Column(String(50), nullable=False, default="todo")
    priority = Column(String(100), nullable=False)

    start = Column(Date, nullable=True)
    end = Column(Date, nullable=True)

    description = Column(Text, nullable=True)
    progress = Column(Integer, nullable=False, default=0)

    project = relationship(
        "Project",
        back_populates="tasks"
    )

    checklist = relationship(
        "TaskChecklist",
        back_populates="task",
        cascade="all, delete-orphan"
    )


class TaskChecklist(Base):
    __tablename__ = "task_checklists"

    id = Column(Integer, primary_key=True)
    task_id = Column(
        Integer,
        ForeignKey("tasks.id", ondelete="CASCADE"),
        nullable=False
    )

    text = Column(Text, nullable=False)
    completed = Column(Integer, nullable=False, default=0)

    task = relationship(
        "Task",
        back_populates="checklist"
    )
# ============================================================
# Template
# ============================================================

class Template(Base):

    __tablename__ = "templates"

    id = Column(
        Integer,
        primary_key=True
    )

    name = Column(
        String(255),
        nullable=False
    )

    owner = Column(
        String(255),
        nullable=True
    )

    status = Column(
        String(50),
        nullable=False,
        default="todo"
    )

    priority = Column(
        String(100),
        nullable=False
    )

    start = Column(
        Date,
        nullable=True
    )

    end = Column(
        Date,
        nullable=True
    )

    description = Column(
        Text,
        nullable=True
    )

    checklist = relationship(
        "TemplateChecklist",
        back_populates="template",
        cascade="all, delete-orphan"
    )


# ============================================================
# Template Checklist
# ============================================================

class TemplateChecklist(Base):

    __tablename__ = "template_checklists"

    id = Column(
        Integer,
        primary_key=True
    )

    template_id = Column(
        Integer,
        ForeignKey(
            "templates.id",
            ondelete="CASCADE"
        ),
        nullable=False
    )

    text = Column(
        Text,
        nullable=False
    )

    completed = Column(
        Integer,
        nullable=False,
        default=0
    )

    template = relationship(
        "Template",
        back_populates="checklist"
    )
