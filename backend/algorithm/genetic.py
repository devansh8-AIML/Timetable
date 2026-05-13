"""
Genetic Algorithm for Timetable Generation
==========================================
- Chromosome  : list of gene dicts, one per subject slot
- Gene        : { subject, subject_code, faculty, room, day, period, class_type }
- Fitness     : 1 / (1 + total_conflicts) — higher is better
- Selection   : top 50 % elitism
- Crossover   : single-point at midpoint
- Mutation    : 10 % per gene (day / period / room)
"""

import random

DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
PERIODS = [1, 2, 3, 4, 5, 6, 7, 8]


# ── helpers ──────────────────────────────────────────────────────────────────

def _suitable_rooms(subject: dict, rooms: list) -> list:
    """Return rooms compatible with the subject type."""
    available = [r for r in rooms if r.get("is_available", True)]
    if subject.get("requires_lab"):
        labs = [r for r in available if r.get("room_type", "").lower() == "lab"]
        return labs if labs else available
    classrooms = [r for r in available if r.get("room_type", "").lower() != "lab"]
    return classrooms if classrooms else available


def _pick_faculty(subject: dict, faculty: list) -> dict:
    """Return a faculty member who can teach the subject (or any if none tagged)."""
    code = subject.get("code", "")
    eligible = [
        f for f in faculty
        if not f.get("on_leave", False) and code in f.get("subjects", "")
    ]
    pool = eligible if eligible else [f for f in faculty if not f.get("on_leave", False)]
    return random.choice(pool) if pool else random.choice(faculty)


# ── chromosome ───────────────────────────────────────────────────────────────

def _build_gene(subject: dict, faculty: list, rooms: list) -> dict:
    room_pool = _suitable_rooms(subject, rooms)
    f = _pick_faculty(subject, faculty)
    return {
        "subject": subject["name"],
        "subject_code": subject.get("code", ""),
        "faculty": f["name"],
        "room": random.choice(room_pool)["number"] if room_pool else "TBD",
        "day": random.choice(DAYS),
        "period": random.choice(PERIODS),
        "class_type": "Lab" if subject.get("requires_lab") else "Lecture",
    }


def _generate_chromosome(subjects: list, faculty: list, rooms: list) -> list:
    """
    Expand subjects by hours_per_week so each weekly slot gets its own gene.
    """
    chromosome = []
    for subject in subjects:
        hours = subject.get("hours_per_week", 3)
        for _ in range(hours):
            chromosome.append(_build_gene(subject, faculty, rooms))
    return chromosome


# ── fitness ──────────────────────────────────────────────────────────────────

def _fitness(chromosome: list) -> float:
    conflicts = 0
    for i in range(len(chromosome)):
        for j in range(i + 1, len(chromosome)):
            a, b = chromosome[i], chromosome[j]
            if a["day"] == b["day"] and a["period"] == b["period"]:
                if a["room"] == b["room"]:
                    conflicts += 1
                if a["faculty"] == b["faculty"]:
                    conflicts += 1
    return 1.0 / (1.0 + conflicts)


# ── operators ────────────────────────────────────────────────────────────────

def _crossover(p1: list, p2: list) -> list:
    point = len(p1) // 2
    return p1[:point] + p2[point:]


def _mutate(chromosome: list, faculty: list, rooms: list, rate: float = 0.1) -> list:
    for gene in chromosome:
        if random.random() < rate:
            gene["day"] = random.choice(DAYS)
            gene["period"] = random.choice(PERIODS)
            # keep room type compatible
            subject_mock = {"requires_lab": gene["class_type"] == "Lab"}
            pool = _suitable_rooms(subject_mock, rooms)
            if pool:
                gene["room"] = random.choice(pool)["number"]
    return chromosome


# ── main entry ───────────────────────────────────────────────────────────────

def run_genetic_algorithm(
    subjects: list,
    faculty: list,
    rooms: list,
    generations: int = 150,
    population_size: int = 60,
) -> list:
    """Run the GA and return the best chromosome found."""

    if not subjects or not faculty or not rooms:
        return []

    population = [
        _generate_chromosome(subjects, faculty, rooms)
        for _ in range(population_size)
    ]

    for _ in range(generations):
        population.sort(key=_fitness, reverse=True)

        survivors = population[: population_size // 2]

        children = []
        for i in range(0, len(survivors) - 1, 2):
            child = _crossover(survivors[i], survivors[i + 1])
            child = _mutate(child, faculty, rooms)
            children.append(child)

        population = survivors + children

    return population[0]
