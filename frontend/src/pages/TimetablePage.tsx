import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { CalendarDays, Download, RefreshCw } from 'lucide-react'
import { getTimetable } from '@/lib/api'
import type { TimetableEntry } from '@/types'
import { DAYS, PERIODS, PERIOD_TIMES, CLASS_TYPE_COLORS, DEPARTMENTS } from '@/lib/utils'

export default function TimetablePage() {
  const [entries, setEntries] = useState<TimetableEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [department, setDepartment] = useState('all')
  const [section, setSection] = useState('all')

  const load = () => {
    setLoading(true)
    getTimetable(
      department !== 'all' ? department : undefined,
      section !== 'all' ? section : undefined,
    )
      .then(setEntries)
      .catch(() => toast.error('Failed to load timetable'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [department, section])

  // Build grid: day -> period -> entry
  const grid: Record<string, Record<number, TimetableEntry[]>> = {}
  for (const day of DAYS) {
    grid[day] = {}
    for (const period of PERIODS) {
      grid[day][period] = entries.filter(
        (e) => e.day === day && e.period === period,
      )
    }
  }

  const handleExport = () => {
    const rows = [
      ['Day', 'Period', 'Time', 'Subject', 'Code', 'Faculty', 'Room', 'Type', 'Dept', 'Section'],
      ...entries.map((e) => [
        e.day,
        e.period,
        PERIOD_TIMES[e.period],
        e.subject,
        e.subject_code,
        e.faculty,
        e.room,
        e.class_type,
        e.department,
        e.section,
      ]),
    ]
    const csv = rows.map((r) => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `timetable-${department}-${section}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <CalendarDays size={22} className="text-purple-400" /> Timetable
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            {entries.length} scheduled slot{entries.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary" onClick={load} disabled={loading}>
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          {entries.length > 0 && (
            <button className="btn-secondary" onClick={handleExport}>
              <Download size={14} />
              Export CSV
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          className="input w-44"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
        >
          <option value="all">All Departments</option>
          {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        <select
          className="input w-32"
          value={section}
          onChange={(e) => setSection(e.target.value)}
        >
          <option value="all">All Sections</option>
          {['A', 'B', 'C', 'D'].map((s) => <option key={s} value={s}>Section {s}</option>)}
        </select>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 text-xs">
        <span className="text-text-muted">Legend:</span>
        <span className="badge bg-accent/10 border border-accent/30 text-accent-light">Lecture</span>
        <span className="badge bg-success/10 border border-success/30 text-success">Lab</span>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="p-12 text-center text-text-muted text-sm">Loading timetable…</div>
      ) : entries.length === 0 ? (
        <div className="card p-12 text-center">
          <CalendarDays size={36} className="text-text-muted mx-auto mb-3" />
          <p className="text-text-secondary text-sm">No timetable generated yet.</p>
          <a href="/generate" className="text-accent-light text-sm underline mt-2 inline-block">
            Go to Generate →
          </a>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="min-w-[700px]">
            {/* Period headers */}
            <div className="grid gap-1 mb-1" style={{ gridTemplateColumns: '100px repeat(8, 1fr)' }}>
              <div />
              {PERIODS.map((p) => (
                <div key={p} className="text-center py-2">
                  <p className="text-xs font-semibold text-text-secondary">P{p}</p>
                  <p className="text-[10px] text-text-muted">{PERIOD_TIMES[p]}</p>
                </div>
              ))}
            </div>

            {/* Day rows */}
            {DAYS.map((day) => (
              <div
                key={day}
                className="grid gap-1 mb-1"
                style={{ gridTemplateColumns: '100px repeat(8, 1fr)' }}
              >
                {/* Day label */}
                <div className="flex items-center px-2">
                  <span className="text-xs font-semibold text-text-secondary">{day.slice(0, 3)}</span>
                </div>

                {/* Cells */}
                {PERIODS.map((period) => {
                  const cell = grid[day][period]
                  return (
                    <div
                      key={period}
                      className="min-h-[72px] rounded-xl border border-bg-border bg-bg-surface p-1 flex flex-col gap-1"
                    >
                      {cell.length === 0 ? (
                        <div className="flex-1 flex items-center justify-center">
                          <span className="text-text-muted text-[10px]">Free</span>
                        </div>
                      ) : (
                        cell.map((entry, i) => (
                          <div
                            key={i}
                            className={`flex-1 rounded-lg border px-1.5 py-1 text-[10px] leading-tight ${CLASS_TYPE_COLORS[entry.class_type] ?? 'bg-bg-elevated border-bg-border text-text-secondary'}`}
                          >
                            <p className="font-bold truncate">{entry.subject_code || entry.subject}</p>
                            <p className="truncate opacity-80">{entry.faculty.split(' ').pop()}</p>
                            <p className="truncate opacity-70">Rm {entry.room}</p>
                          </div>
                        ))
                      )}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* List view for mobile / accessibility */}
      {entries.length > 0 && (
        <details className="card">
          <summary className="px-5 py-3 text-sm font-medium text-text-secondary cursor-pointer hover:text-text-primary transition-colors select-none">
            List View ({entries.length} entries)
          </summary>
          <div className="overflow-x-auto border-t border-bg-border">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-bg-elevated border-b border-bg-border">
                  {['Day', 'Period', 'Time', 'Subject', 'Faculty', 'Room', 'Type', 'Dept', 'Sec'].map((h) => (
                    <th key={h} className="text-left px-3 py-2 text-text-muted font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {entries
                  .sort((a, b) => ([...DAYS] as string[]).indexOf(a.day) - ([...DAYS] as string[]).indexOf(b.day) || a.period - b.period)
                  .map((e, i) => (
                    <tr key={i} className="border-b border-bg-border last:border-0 hover:bg-bg-elevated/50">
                      <td className="px-3 py-2 text-text-secondary">{e.day.slice(0, 3)}</td>
                      <td className="px-3 py-2 font-mono text-text-primary">P{e.period}</td>
                      <td className="px-3 py-2 text-text-muted">{PERIOD_TIMES[e.period]}</td>
                      <td className="px-3 py-2 text-text-primary font-medium">{e.subject}</td>
                      <td className="px-3 py-2 text-text-secondary">{e.faculty}</td>
                      <td className="px-3 py-2 font-mono text-text-secondary">{e.room}</td>
                      <td className="px-3 py-2">
                        <span className={e.class_type === 'Lab' ? 'badge-success' : 'badge-accent'}>
                          {e.class_type}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-text-muted">{e.department}</td>
                      <td className="px-3 py-2 text-text-muted">{e.section}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </details>
      )}
    </div>
  )
}
