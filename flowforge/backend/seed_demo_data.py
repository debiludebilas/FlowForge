"""
Replace all tasks with showcase demo data for screenshots and README GIFs.

Usage (from flowforge/backend):
    python seed_demo_data.py
"""

from database import SessionLocal
from models import Task, TaskStatus, TaskPriority

DEMO_TASKS = [
    {
        "title": "Record README demo GIF",
        "description": "Capture create → drag → inline edit → priority change in under 30 seconds.",
        "status": TaskStatus.todo,
        "priority": TaskPriority.urgent,
    },
    {
        "title": "Deploy frontend to Render",
        "description": "Verify Docker build and confirm the live demo URL in the README.",
        "status": TaskStatus.todo,
        "priority": TaskPriority.normal,
    },
    {
        "title": "Add screenshot assets to docs/",
        "description": "Board overview, drag-and-drop, and inline editing — PNGs in docs/screenshots/.",
        "status": TaskStatus.todo,
        "priority": TaskPriority.low,
    },
    {
        "title": "Polish Kanban card layout",
        "description": "Priority lights, compact drag preview, and inline editing for titles and descriptions.",
        "status": TaskStatus.in_progress,
        "priority": TaskPriority.normal,
    },
    {
        "title": "Cross-column drag and drop",
        "description": "Live preview when moving tasks between To Do, In Progress, and Done.",
        "status": TaskStatus.in_progress,
        "priority": TaskPriority.urgent,
    },
    {
        "title": "Fix API enum migration for priority field",
        "description": "SQLite stores display values (Normal, Urgent, Low) — not internal enum names.",
        "status": TaskStatus.in_progress,
        "priority": TaskPriority.low,
    },
    {
        "title": "Design FlowForge logo",
        "description": "Anvil mark with purple gradient — swapped out the generic clipboard icon.",
        "status": TaskStatus.done,
        "priority": TaskPriority.normal,
    },
    {
        "title": "Implement task CRUD API",
        "description": "FastAPI + SQLAlchemy endpoints with Swagger docs at /docs.",
        "status": TaskStatus.done,
        "priority": TaskPriority.normal,
    },
    {
        "title": "Dockerise full-stack app",
        "description": "docker-compose up --build runs backend on :8000 and frontend on :5173.",
        "status": TaskStatus.done,
        "priority": TaskPriority.low,
    },
    {
        "title": "Set up @dnd-kit sortable board",
        "description": "Drag handle on cards, column drop highlights, and optimistic reordering.",
        "status": TaskStatus.done,
        "priority": TaskPriority.urgent,
    },
]


def seed() -> None:
    db = SessionLocal()
    try:
        deleted = db.query(Task).delete()
        for item in DEMO_TASKS:
            db.add(Task(**item))
        db.commit()
        print(f"Cleared {deleted} old task(s). Inserted {len(DEMO_TASKS)} demo tasks.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()