export interface Faculty {
  id: number
  name: string
  department: string
  subjects: string
  max_hours: number
  on_leave: boolean
}

export interface Room {
  id: number
  number: string
  capacity: number
  room_type: string
  is_available: boolean
}

export interface Subject {
  id: number
  name: string
  code: string
  department: string
  hours_per_week: number
  requires_lab: boolean
}

export interface TimetableEntry {
  id?: number
  subject: string
  subject_code: string
  faculty: string
  room: string
  day: string
  period: number
  department: string
  section: string
  class_type: string
}

export interface Conflict {
  type: 'Room Clash' | 'Faculty Overlap'
  slot: string
  room?: string
  faculty?: string
  subjects: string[]
}

export interface GenerateResult {
  timetable: TimetableEntry[]
  conflicts: Conflict[]
  conflict_count: number
  fitness_score: number
  total_slots: number
  status: string
}

export type NavItem = {
  label: string
  path: string
  icon: string
}
