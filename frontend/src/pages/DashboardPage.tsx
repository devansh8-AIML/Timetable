import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Users, DoorOpen, BookOpen, CalendarDays, Sparkles, ArrowRight, TrendingUp } from 'lucide-react'
import { getFaculty, getRooms, getSubjects, getTimetable } from '@/lib/api'
import type { Faculty, Room, Subject, TimetableEntry } from '@/types'

interface Stats {
  faculty: number
  rooms: number
  subjects: number
  slots: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({ faculty: 0, rooms: 0, subjects: 0, slots: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getFaculty(), getRooms(), getSubjects(), getTimetable()])
      .then(([f, r, s, t]) => {
        setStats({
          faculty: (f as Faculty[]).length,
          rooms: (r as Room[]).length,
          subjects: (s as Subject[]).length,
          slots: (t as TimetableEntry[]).length,
        })
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const STAT_CARDS = [
    {
      label: 'Faculty Members',
      value: stats.faculty,
      icon: Users,
      color: 'bg-accent/15 text-accent-light',
      link: '/faculty',
    },
    {
      label: 'Rooms',
      value: stats.rooms,
      icon: DoorOpen,
      color: 'bg-success/15 text-success',
      link: '/rooms',
    },
    {
      label: 'Subjects',
      value: stats.subjects,
      icon: BookOpen,
      color: 'bg-warning/15 text-warning',
      link: '/subjects',
    },
    {
      label: 'Scheduled Slots',
      value: stats.slots,
      icon: CalendarDays,
      color: 'bg-purple-500/15 text-purple-400',
      link: '/timetable',
    },
  ]

  const QUICK_LINKS = [
    { label: 'Add Faculty', path: '/faculty', icon: Users, desc: 'Manage lecturers & professors' },
    { label: 'Add Rooms', path: '/rooms', icon: DoorOpen, desc: 'Classrooms and labs' },
    { label: 'Add Subjects', path: '/subjects', icon: BookOpen, desc: 'Course catalog' },
    { label: 'Generate Timetable', path: '/generate', icon: Sparkles, desc: 'Run the genetic algorithm', primary: true },
  ]

  return (
    <div className="p-6 space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
        <p className="text-text-secondary text-sm mt-1">
          Overview of your timetable management system
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map(({ label, value, icon: Icon, color, link }) => (
          <Link key={label} to={link} className="stat-card hover:border-bg-border/80 transition-colors group">
            <div className={`stat-icon ${color}`}>
              <Icon size={18} />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary font-mono">
                {loading ? '—' : value}
              </p>
              <p className="text-xs text-text-secondary mt-0.5">{label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Status banner */}
      {!loading && stats.slots === 0 && (
        <div className="card p-4 border-accent/30 bg-accent/5 flex items-center gap-3">
          <TrendingUp size={18} className="text-accent-light flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text-primary">No timetable generated yet</p>
            <p className="text-xs text-text-secondary">Add faculty, rooms, and subjects then generate your first timetable.</p>
          </div>
          <Link to="/generate" className="btn-primary flex-shrink-0">
            Generate <ArrowRight size={14} />
          </Link>
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {QUICK_LINKS.map(({ label, path, icon: Icon, desc, primary }) => (
            <Link
              key={path}
              to={path}
              className={`card p-4 hover:border-bg-border/60 transition-all group flex flex-col gap-3 ${
                primary ? 'border-accent/30 bg-accent/5 hover:bg-accent/10' : ''
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  primary ? 'bg-accent text-white' : 'bg-bg-elevated text-text-secondary group-hover:text-text-primary'
                }`}
              >
                <Icon size={16} />
              </div>
              <div>
                <p className={`text-sm font-semibold ${primary ? 'text-accent-light' : 'text-text-primary'}`}>
                  {label}
                </p>
                <p className="text-xs text-text-muted mt-0.5">{desc}</p>
              </div>
              <ArrowRight
                size={14}
                className={`mt-auto ${primary ? 'text-accent-light' : 'text-text-muted group-hover:text-text-secondary'} transition-colors`}
              />
            </Link>
          ))}
        </div>
      </div>

      {/* Workflow guide */}
      <div>
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">
          How It Works
        </h2>
        <div className="card p-5">
          <div className="flex flex-col sm:flex-row gap-4">
            {[
              { step: '01', title: 'Add Data', desc: 'Enter faculty, rooms, and subjects into the system.' },
              { step: '02', title: 'Configure', desc: 'Choose department, section, and scheduling options.' },
              { step: '03', title: 'Generate', desc: 'Run the genetic algorithm to produce an optimal schedule.' },
              { step: '04', title: 'Review', desc: 'Check conflicts, fitness score, and export the timetable.' },
            ].map(({ step, title, desc }, i) => (
              <div key={step} className="flex-1 flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-7 h-7 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-[10px] font-bold text-accent-light">{step}</span>
                  </div>
                  {i < 3 && <div className="w-px flex-1 bg-bg-border mt-2 hidden sm:block" />}
                </div>
                <div className="pb-4">
                  <p className="text-sm font-semibold text-text-primary">{title}</p>
                  <p className="text-xs text-text-secondary mt-1">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
