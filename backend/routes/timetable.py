from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database.db import get_db
from models.timetable import TimetableEntry
from schemas.schemas import GenerateRequest, TimetableEntryOut
from algorithm.genetic import run_genetic_algorithm
from algorithm.conflict import detect_conflicts
from algorithm.fitness import calculate_fitness

router = APIRouter()


@router.post("/generate")
def generate_timetable(data: GenerateRequest, db: Session = Depends(get_db)):
    timetable = run_genetic_algorithm(
        data.subjects,
        data.faculty,
        data.rooms,
    )

    conflicts = detect_conflicts(timetable)
    fitness = calculate_fitness(timetable)

    # Persist — clear previous entries for this dept/section
    db.query(TimetableEntry).filter(
        TimetableEntry.department == data.department,
        TimetableEntry.section == data.section,
    ).delete()

    for entry in timetable:
        row = TimetableEntry(
            subject=entry["subject"],
            subject_code=entry.get("subject_code", ""),
            faculty=entry["faculty"],
            room=entry["room"],
            day=entry["day"],
            period=entry["period"],
            department=data.department,
            section=data.section,
            class_type=entry.get("class_type", "Lecture"),
        )
        db.add(row)

    db.commit()

    return {
        "timetable": timetable,
        "conflicts": conflicts,
        "conflict_count": len(conflicts),
        "fitness_score": round(fitness, 4),
        "total_slots": len(timetable),
        "status": "success",
    }


@router.get("/", response_model=list[TimetableEntryOut])
def get_timetable(
    department: str = None,
    section: str = None,
    db: Session = Depends(get_db),
):
    query = db.query(TimetableEntry)
    if department:
        query = query.filter(TimetableEntry.department == department)
    if section:
        query = query.filter(TimetableEntry.section == section)
    return query.all()


@router.post("/resolve")
def resolve_conflicts(data: dict):
    """Nudge conflicting slots to different periods."""
    timetable = data.get("timetable", [])
    conflicts_before = detect_conflicts(timetable)

    seen: set = set()
    for gene in timetable:
        key = (gene["day"], gene["period"], gene["room"])
        while key in seen:
            gene["period"] = (gene["period"] % 8) + 1
            key = (gene["day"], gene["period"], gene["room"])
        seen.add(key)

    conflicts_after = detect_conflicts(timetable)
    fitness = calculate_fitness(timetable)

    return {
        "timetable": timetable,
        "conflicts": conflicts_after,
        "conflict_count": len(conflicts_after),
        "fitness_score": round(fitness, 4),
        "resolved_count": len(conflicts_before) - len(conflicts_after),
        "status": "resolved",
    }


@router.delete("/clear")
def clear_timetable(
    department: str = None,
    section: str = None,
    db: Session = Depends(get_db),
):
    query = db.query(TimetableEntry)
    if department:
        query = query.filter(TimetableEntry.department == department)
    if section:
        query = query.filter(TimetableEntry.section == section)
    count = query.delete()
    db.commit()
    return {"message": f"Cleared {count} entries"}
