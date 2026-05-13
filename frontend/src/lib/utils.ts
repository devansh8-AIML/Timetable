import { clsx, type ClassValue } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as const
export const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8] as const

export const PERIOD_TIMES: Record<number, string> = {
  1: '8:00 – 9:00',
  2: '9:00 – 10:00',
  3: '10:00 – 11:00',
  4: '11:00 – 12:00',
  5: '12:00 – 1:00',
  6: '1:00 – 2:00',
  7: '2:00 – 3:00',
  8: '3:00 – 4:00',
}

export const DEPARTMENTS = [
  'CSE', 'ECE', 'ME', 'CE', 'EE', 'IT', 'AIDS', 'AIML', 'DS', 'Other',
]

export const CLASS_TYPE_COLORS: Record<string, string> = {
  Lecture: 'bg-accent/10 border-accent/30 text-accent-light',
  Lab: 'bg-success/10 border-success/30 text-success',
}

export function fitnessLabel(score: number): { label: string; color: string } {
  if (score >= 0.95) return { label: 'Excellent', color: 'text-success' }
  if (score >= 0.80) return { label: 'Good', color: 'text-warning' }
  return { label: 'Needs Work', color: 'text-danger' }
}
