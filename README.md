# 🗓️ TimetableAI — Automated College Timetable Generator

A full-stack intelligent timetable generation system using a **Genetic Algorithm** for conflict-free scheduling.

---

## 📁 Project Structure

```
timetable-project/
├── backend/        # FastAPI + SQLAlchemy + Genetic Algorithm
├── frontend/       # React + Vite + Tailwind CSS
└── README.md
```

---

## 🚀 Features

- **Genetic Algorithm** scheduling engine (100 generations, 50 population)
- **Conflict detection** — room clashes & faculty overlaps
- **Faculty management** — add, delete, toggle leave status
- **Room management** — classrooms & labs
- **Subject management** — with lab/lecture distinction
- **Timetable grid view** — day × period matrix
- **Fitness score** display after generation
- **Dark-themed** modern UI

---

## ⚙️ Backend Setup

### Requirements
- Python 3.10+

### Install & Run

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

API runs at: `http://localhost:8000`  
Swagger docs: `http://localhost:8000/docs`

### Environment Variables

Create a `.env` file in the `backend/` folder:

```env
DATABASE_URL=sqlite:///./timetable.db
```

For PostgreSQL (production):
```env
DATABASE_URL=postgresql://user:password@host:5432/timetable
```

---

## 🖥️ Frontend Setup

### Requirements
- Node.js 18+

### Install & Run

```bash
cd frontend
npm install
npm run dev
```

App runs at: `http://localhost:5173`

### Environment Variables

Create a `.env` file in the `frontend/` folder:

```env
VITE_API_URL=http://localhost:8000
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/faculty` | List all faculty |
| POST | `/api/faculty` | Add faculty |
| PUT | `/api/faculty/{id}/leave` | Toggle leave status |
| DELETE | `/api/faculty/{id}` | Delete faculty |
| GET | `/api/rooms` | List all rooms |
| POST | `/api/rooms` | Add room |
| DELETE | `/api/rooms/{id}` | Delete room |
| GET | `/api/subjects` | List all subjects |
| POST | `/api/subjects` | Add subject |
| DELETE | `/api/subjects/{id}` | Delete subject |
| POST | `/api/timetable/generate` | Generate timetable |
| GET | `/api/timetable` | Get saved timetable |
| POST | `/api/timetable/resolve` | Resolve conflicts |

---

## 🧬 Algorithm

The timetable is generated using a **Genetic Algorithm**:

1. **Population** — 50 random timetable chromosomes
2. **Fitness** — penalises room clashes and faculty overlaps
3. **Selection** — top 50% survive each generation
4. **Crossover** — midpoint gene exchange between parents
5. **Mutation** — 10% chance to randomise day/period/room
6. **Iterations** — 100 generations

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | FastAPI, SQLAlchemy, Pydantic |
| Database | SQLite (dev), PostgreSQL (prod) |
| Algorithm | Pure Python genetic algorithm |
| Frontend | React 18, Vite, Tailwind CSS |
| UI Components | Custom components |
| HTTP Client | Fetch API |

---

## 🚢 Deployment

### Backend (Render / Railway)
```bash
# render.yaml already included
# Set DATABASE_URL env var to your PostgreSQL URL
```

### Frontend (Vercel / Netlify)
```bash
npm run build
# Upload dist/ folder or connect GitHub repo
# Set VITE_API_URL to your backend URL
```
