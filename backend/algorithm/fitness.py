"""
Fitness Calculation
===================
Returns a score in (0, 1].  Score = 1.0 means zero conflicts (perfect).
"""

from typing import List, Dict


def calculate_fitness(chromosome: List[Dict]) -> float:
    conflicts = 0
    n = len(chromosome)

    for i in range(n):
        for j in range(i + 1, n):
            a, b = chromosome[i], chromosome[j]
            if a["day"] == b["day"] and a["period"] == b["period"]:
                if a["room"] == b["room"]:
                    conflicts += 1
                if a["faculty"] == b["faculty"]:
                    conflicts += 1

    return 1.0 / (1.0 + conflicts)
