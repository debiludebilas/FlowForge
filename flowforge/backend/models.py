from sqlalchemy import Column, Integer, String, Enum as SQLEnum
from pydantic import BaseModel
from enum import Enum
from typing import Optional, Type
from database import Base


class TaskStatus(str, Enum):
    todo = "To Do"
    in_progress = "In Progress"
    done = "Done"


class TaskPriority(str, Enum):
    low = "Low"
    normal = "Normal"
    urgent = "Urgent"


def enum_values(enum_cls: Type[Enum]) -> list[str]:
    return [member.value for member in enum_cls]


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(100), index=True)
    description = Column(String(500), nullable=True)
    status = Column(
        SQLEnum(TaskStatus, values_callable=enum_values, native_enum=False),
        default=TaskStatus.todo,
    )
    priority = Column(
        SQLEnum(TaskPriority, values_callable=enum_values, native_enum=False),
        default=TaskPriority.normal,
    )


class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    status: TaskStatus = TaskStatus.todo
    priority: TaskPriority = TaskPriority.normal


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[TaskStatus] = None
    priority: Optional[TaskPriority] = None


class TaskOut(TaskBase):
    id: int

    class Config:
        from_attributes = True