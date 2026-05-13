"""
Conflict Detection
==================
Scans a timetable chromosome for:
  - Room Clash    : two subjects in the same room at the same time
  - Faculty Overlap: same faculty member assigned to two slots simultaneously
"""

from typing import List, Dict


def detect_conflicts(timetable: List[Dict]) -> List[Dict]:
    conflicts = []
    n = len(timetable)

    for i in range(n):
        for j in range(i + 1, n):
            a, b = timetable[i], timetable[j]
            same_slot = a["day"] == b["day"] and a["period"] == b["period"]

            if same_slot:
                if a["room"] == b["room"]:
                    conflicts.append({
                        "type": "Room Clash",
                        "slot": f"{a['day']} — Period {a['period']}",
                        "room": a["room"],
                        "subjects": [a["subject"], b["subject"]],
                    })

                if a["faculty"] == b["faculty"]:
                    conflicts.append({
                        "type": "Faculty Overlap",
                        "slot": f"{a['day']} — Period {a['period']}",
                        "faculty": a["faculty"],
                        "subjects": [a["subject"], b["subject"]],
                    })

    return conflicts
