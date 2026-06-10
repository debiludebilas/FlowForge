from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base, run_migrations
from routers import tasks

app = FastAPI(title="FlowForge API")

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins = origins,
    allow_credentials = True,
    allow_methods = ["*"],
    allow_headers = ["*"],
)

Base.metadata.create_all(bind=engine)
run_migrations()

app.include_router(tasks.router)

@app.get("/")
def read_root():
    return {"message": "Flowforge API works"}


