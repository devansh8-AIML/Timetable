from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database.db import get_db
from models.room import Room
from schemas.schemas import RoomCreate, RoomOut

router = APIRouter()


@router.get("/", response_model=list[RoomOut])
def get_all_rooms(db: Session = Depends(get_db)):
    return db.query(Room).all()


@router.post("/", response_model=RoomOut, status_code=201)
def add_room(data: RoomCreate, db: Session = Depends(get_db)):
    room = Room(**data.model_dump())
    db.add(room)
    db.commit()
    db.refresh(room)
    return room


@router.put("/{room_id}")
def update_room_availability(room_id: int, db: Session = Depends(get_db)):
    room = db.query(Room).filter(Room.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    room.is_available = not room.is_available
    db.commit()
    return {"message": "Availability toggled", "is_available": room.is_available}


@router.delete("/{room_id}")
def delete_room(room_id: int, db: Session = Depends(get_db)):
    room = db.query(Room).filter(Room.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    db.delete(room)
    db.commit()
    return {"message": "Room deleted successfully"}
