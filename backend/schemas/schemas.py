from pydantic import BaseModel, ConfigDict
from typing import Optional, List


# ── Faculty ──────────────────────────────────────────────────────────────────

class FacultyCreate(BaseModel):
    name: str
    department: str
    subjects: str          # comma-separated subject codes, e.g. "CS101,CS201"
    max_hours: Optional[int] = 20
    on_leave: Optional[bool] = False


class FacultyOut(FacultyCreate):
    id: int
    model_config = ConfigDict(from_attributes=True)


# ── Room ─────────────────────────────────────────────────────────────────────

class RoomCreate(BaseModel):
    number: str
    capacity: int
    room_type: Optional[str] = "Classroom"
    is_available: Optional[bool] = True


class RoomOut(RoomCreate):
    id: int
    model_config = ConfigDict(from_attributes=True)


# ── Subject ──────────────────────────────────────────────────────────────────

class SubjectCreate(BaseModel):
    name: str
    code: str
    department: str
    hours_per_week: Optional[int] = 3
    requires_lab: Optional[bool] = False


class SubjectOut(SubjectCreate):
    id: int
    model_config = ConfigDict(from_attributes=True)


# ── Timetable ────────────────────────────────────────────────────────────────

class TimetableEntryOut(BaseModel):
    id: int
    subject: str
    subject_code: str
    faculty: str
    room: str
    day: str
    period: int
    department: str
    section: str
    class_type: str
    model_config = ConfigDict(from_attributes=True)


class GenerateRequest(BaseModel):
    subjects: List[dict]
    faculty: List[dict]
    rooms: List[dict]
    section: Optional[str] = "A"
    department: Optional[str] = "CSE"
