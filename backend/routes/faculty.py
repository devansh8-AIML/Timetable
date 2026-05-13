from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database.db import get_db
from models.faculty import Faculty
from schemas.schemas import FacultyCreate, FacultyOut

router = APIRouter()


@router.get("/", response_model=list[FacultyOut])
def get_all_faculty(db: Session = Depends(get_db)):
    return db.query(Faculty).all()


@router.get("/{faculty_id}", response_model=FacultyOut)
def get_faculty(faculty_id: int, db: Session = Depends(get_db)):
    faculty = db.query(Faculty).filter(Faculty.id == faculty_id).first()
    if not faculty:
        raise HTTPException(status_code=404, detail="Faculty not found")
    return faculty


@router.post("/", response_model=FacultyOut, status_code=201)
def add_faculty(data: FacultyCreate, db: Session = Depends(get_db)):
    faculty = Faculty(**data.model_dump())
    db.add(faculty)
    db.commit()
    db.refresh(faculty)
    return faculty


@router.put("/{faculty_id}/leave")
def toggle_leave(faculty_id: int, db: Session = Depends(get_db)):
    faculty = db.query(Faculty).filter(Faculty.id == faculty_id).first()
    if not faculty:
        raise HTTPException(status_code=404, detail="Faculty not found")
    faculty.on_leave = not faculty.on_leave
    db.commit()
    return {"message": "Leave status updated", "on_leave": faculty.on_leave}


@router.delete("/{faculty_id}")
def delete_faculty(faculty_id: int, db: Session = Depends(get_db)):
    faculty = db.query(Faculty).filter(Faculty.id == faculty_id).first()
    if not faculty:
        raise HTTPException(status_code=404, detail="Faculty not found")
    db.delete(faculty)
    db.commit()
    return {"message": "Faculty deleted successfully"}
