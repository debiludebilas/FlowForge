from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import sessionmaker, DeclarativeBase

DATABASE_URL = "sqlite:///./flowforge.db"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def run_migrations():
    inspector = inspect(engine)
    if not inspector.has_table("tasks"):
        return

    columns = [col["name"] for col in inspector.get_columns("tasks")]
    if "priority" not in columns:
        with engine.begin() as conn:
            conn.execute(
                text("ALTER TABLE tasks ADD COLUMN priority VARCHAR(20) DEFAULT 'Normal'")
            )

    # Normalise legacy enum names (e.g. "normal") to display values ("Normal")
    with engine.begin() as conn:
        conn.execute(text("UPDATE tasks SET priority = 'Low' WHERE priority = 'low'"))
        conn.execute(text("UPDATE tasks SET priority = 'Normal' WHERE priority = 'normal' OR priority IS NULL"))
        conn.execute(text("UPDATE tasks SET priority = 'Urgent' WHERE priority = 'urgent'"))
        conn.execute(text("UPDATE tasks SET status = 'To Do' WHERE status = 'todo'"))
        conn.execute(text("UPDATE tasks SET status = 'In Progress' WHERE status = 'in_progress'"))
        conn.execute(text("UPDATE tasks SET status = 'Done' WHERE status = 'done'"))


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()