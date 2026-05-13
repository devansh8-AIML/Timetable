from sqlalchemy import Column, Integer, String
from database.db import Base


class TimetableEntry(Base):
    __tablename__ = "timetable"

    id = Column(Integer, primary_key=True, index=True)
    subject = Column(String, nullable=False)
    subject_code = Column(String, nullable=False, default="")
    faculty = Column(String, nullable=False)
    room = Column(String, nullable=False)
    day = Column(String, nullable=False)
    period = Column(Integer, nullable=False)
    department = Column(String, nullable=False)
    section = Column(String, nullable=False)
    class_type = Column(String, default="Lecture")   # "Lecture" | "Lab"
