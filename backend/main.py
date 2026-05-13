from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database.db import Base, engine
from routes import faculty, rooms, subjects, timetable

# Create all database tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="TimetableAI API",
    description="Intelligent timetable generation with genetic algorithm scheduling",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # lock down in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(faculty.router, prefix="/api/faculty", tags=["Faculty"])
app.include_router(rooms.router, prefix="/api/rooms", tags=["Rooms"])
app.include_router(subjects.router, prefix="/api/subjects", tags=["Subjects"])
app.include_router(timetable.router, prefix="/api/timetable", tags=["Timetable"])


@app.get("/", tags=["Health"])
def root():
    return {
        "status": "✅ TimetableAI API is running",
        "version": "2.0.0",
        "docs": "/docs",
    }


@app.get("/health", tags=["Health"])
def health():
    return {"status": "ok"}
