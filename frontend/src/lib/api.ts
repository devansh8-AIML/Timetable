import type { Faculty, Room, Subject, GenerateResult, TimetableEntry } from '@/types'

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail ?? 'Request failed')
  }
  return res.json() as Promise<T>
}

// ── Faculty ──────────────────────────────────────────────────────────────────
export const getFaculty = () => request<Faculty[]>('/api/faculty')

export const addFaculty = (data: Omit<Faculty, 'id'>) =>
  request<Faculty>('/api/faculty', { method: 'POST', body: JSON.stringify(data) })

export const toggleLeave = (id: number) =>
  request<{ on_leave: boolean }>(`/api/faculty/${id}/leave`, { method: 'PUT' })

export const deleteFaculty = (id: number) =>
  request<{ message: string }>(`/api/faculty/${id}`, { method: 'DELETE' })

// ── Rooms ────────────────────────────────────────────────────────────────────
export const getRooms = () => request<Room[]>('/api/rooms')

export const addRoom = (data: Omit<Room, 'id'>) =>
  request<Room>('/api/rooms', { method: 'POST', body: JSON.stringify(data) })

export const deleteRoom = (id: number) =>
  request<{ message: string }>(`/api/rooms/${id}`, { method: 'DELETE' })

// ── Subjects ─────────────────────────────────────────────────────────────────
export const getSubjects = () => request<Subject[]>('/api/subjects')

export const addSubject = (data: Omit<Subject, 'id'>) =>
  request<Subject>('/api/subjects', { method: 'POST', body: JSON.stringify(data) })

export const deleteSubject = (id: number) =>
  request<{ message: string }>(`/api/subjects/${id}`, { method: 'DELETE' })

// ── Timetable ────────────────────────────────────────────────────────────────
export const generateTimetable = (data: {
  subjects: Subject[]
  faculty: Faculty[]
  rooms: Room[]
  department: string
  section: string
}) => request<GenerateResult>('/api/timetable/generate', { method: 'POST', body: JSON.stringify(data) })

export const getTimetable = (department?: string, section?: string) => {
  const params = new URLSearchParams()
  if (department) params.set('department', department)
  if (section) params.set('section', section)
  const qs = params.toString()
  return request<TimetableEntry[]>(`/api/timetable${qs ? `?${qs}` : ''}`)
}

export const resolveConflicts = (timetable: TimetableEntry[]) =>
  request<GenerateResult>('/api/timetable/resolve', {
    method: 'POST',
    body: JSON.stringify({ timetable }),
  })
