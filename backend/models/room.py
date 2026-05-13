from sqlalchemy import Column, Integer, String, Boolean
from database.db import Base


class Room(Base):
    __tablename__ = "rooms"

    id = Column(Integer, primary_key=True, index=True)
    number = Column(String, nullable=False, unique=True)
    capacity = Column(Integer, nullable=False)
    room_type = Column(String, default="Classroom")   # "Classroom" | "Lab"
    is_available = Column(Boolean, default=True)
