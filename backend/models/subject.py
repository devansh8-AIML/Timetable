from sqlalchemy import Column, Integer, String, Boolean
from database.db import Base


class Subject(Base):
    __tablename__ = "subjects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    code = Column(String, nullable=False, unique=True)
    department = Column(String, nullable=False)
    hours_per_week = Column(Integer, default=3)
    requires_lab = Column(Boolean, default=False)
