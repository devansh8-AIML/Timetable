from sqlalchemy import Column, Integer, String, Boolean
from database.db import Base


class Faculty(Base):
    __tablename__ = "faculty"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    department = Column(String, nullable=False)
    subjects = Column(String, nullable=False)   # comma-separated subject codes
    max_hours = Column(Integer, default=20)
    on_leave = Column(Boolean, default=False)
