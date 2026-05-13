import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import {
  Sparkles, AlertTriangle, CheckCircle2, Zap, Clock, ChevronDown, ChevronUp,
} from 'lucide-react'
import { getFaculty, getRooms, getSubjects, generateTimetable, resolveConflicts } from '@/lib/api'
import type { Faculty, Room, Subject, GenerateResult, TimetableEntry } from '@/types'
import { DEPARTMENTS, fitnessLabel } from '@/lib/utils'

export default function GeneratePage() {
  const [faculty, setFaculty] = useState<Faculty[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])

  const [department, setDepartment] = useState('CSE')
  const [section, setSection] = useState('A')

  const [result, setResult] = useState<GenerateResult | null>(null)
  const [generating, setGenerating] = useState(false)
  const [resolving, setResolving] = useState(false)
  const [showConflicts, setShowConflicts] = useState(true)

  useEffect(() => {
    Promise.all([getFaculty(), getRooms(), getSubjects()])
      .then(([f, r, s]) => {
        setFaculty(f as Faculty[])
        setRooms(r as Room[])
        setSubjects(s as Subject[])
      })
      .catch(() => toast.error('Failed to load data'))
  }, [])

  const deptSubjects = subjects.filter((s) => s.department === department)
  const availFaculty = faculty.filter((f) => !f.on_leave && f.department === department)
  const availRooms = rooms.filter((r) => r.is_available)

  const canGenerate = deptSubjects.length > 0 && availFaculty.length > 0 && availRooms.length > 0

  const handleGenerate = async () => {
    if (!canGenerate) {
      toast.error('Need at least 1 subject, 1 available faculty, and 1 available room')
      return
    }
    setGenerating(true)
    setResult(null)
    try {
      const res = await generateTimetable({
        subjects: deptSubjects,
        faculty: availFaculty,
        rooms: availRooms,
        department,
        section,
      })
      setResult(res)
      if (res.conflict_count === 0) {
        toast.success('Perfect timetable generated — zero conflicts!')
      } else {
        toast(`Generated with ${res.conflict_count} conflict${res.conflict_count > 1 ? 's' : ''}`, {
          icon: '⚠️',
        })
      }
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setGenerating(false)
    }
  }

  const handleResolve = async () => {
    if (!result) return
    setResolving(true)
    try {
      const res = await resolveConflicts(result.timetable as TimetableEntry[])
      setResult(res)
      toast.success(`Resolved! ${res.conflict_count} conflict${res.conflict_count === 1 ? '' : 's'} remaining.`)
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setResolving(false)
    }
  }

  const fitness = result ? fitnessLabel(result.fitness_score) : null

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
          <Sparkles size={22} className="text-accent-light" /> Generate Timetable
        </h1>
        <p className="text-text-secondary text-sm mt-1">
          Configure parameters and run the genetic algorithm
        </p>
      </div>

      {/* Config Card */}
      <div className="card p-5 space-y-5">
        <h2 className="text-sm font-semibold text-text-primary">Configuration</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Department</label>
            <select
              className="input"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            >
              {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Section</label>
            <select
              className="input"
              value={section}
              onChange={(e) => setSection(e.target.value)}
            >
              {['A', 'B', 'C', 'D'].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Data summary */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Subjects', count: deptSubjects.length, ok: deptSubjects.length > 0 },
            { label: 'Available Faculty', count: availFaculty.length, ok: availFaculty.length > 0 },
            { label: 'Available Rooms', count: availRooms.length, ok: availRooms.length > 0 },
          ].map(({ label, count, ok }) => (
            <div
              key={label}
              className={`p-3 rounded-xl border text-center ${ok ? 'bg-success/5 border-success/20' : 'bg-danger/5 border-danger/20'}`}
            >
              <p className={`text-lg font-bold font-mono ${ok ? 'text-success' : 'text-danger'}`}>{count}</p>
              <p className="text-xs text-text-muted mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Algorithm info */}
        <div className="bg-bg-elevated rounded-xl p-4 text-xs text-text-secondary space-y-1 border border-bg-border">
          <p className="font-medium text-text-primary flex items-center gap-1.5">
            <Zap size={13} className="text-accent-light" /> Algorithm Parameters
          </p>
          <div className="grid grid-cols-2 gap-x-4 mt-2">
            <p>Generations: <span className="text-text-primary font-mono">150</span></p>
            <p>Population: <span className="text-text-primary font-mono">60</span></p>
            <p>Mutation rate: <span className="text-text-primary font-mono">10%</span></p>
            <p>Selection: <span className="text-text-primary font-mono">Top 50%</span></p>
          </div>
        </div>

        <button
          className="btn-primary w-full justify-center py-3 text-base"
          onClick={handleGenerate}
          disabled={generating || !canGenerate}
        >
          {generating ? (
            <>
              <Clock size={16} className="animate-spin" />
              Running Genetic Algorithm…
            </>
          ) : (
            <>
              <Sparkles size={16} />
              Generate Timetable
            </>
          )}
        </button>
      </div>

      {/* Result */}
      {result && (
        <div className="space-y-4 animate-slide-up">
          {/* Score Card */}
          <div className="card p-5">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-3">
                {result.conflict_count === 0 ? (
                  <CheckCircle2 size={32} className="text-success" />
                ) : (
                  <AlertTriangle size={32} className="text-warning" />
                )}
                <div>
                  <p className="text-sm text-text-secondary">Result</p>
                  <p className="font-bold text-text-primary">
                    {result.conflict_count === 0 ? 'Conflict-Free Schedule' : `${result.conflict_count} Conflicts Detected`}
                  </p>
                </div>
              </div>

              <div className="h-10 w-px bg-bg-border hidden sm:block" />

              <div className="text-center">
                <p className="text-2xl font-bold font-mono text-text-primary">
                  {(result.fitness_score * 100).toFixed(1)}%
                </p>
                <p className={`text-xs font-medium ${fitness?.color}`}>{fitness?.label} Fitness</p>
              </div>

              <div className="text-center">
                <p className="text-2xl font-bold font-mono text-text-primary">{result.total_slots}</p>
                <p className="text-xs text-text-secondary">Scheduled Slots</p>
              </div>

              {result.conflict_count > 0 && (
                <button
                  className="btn-secondary ml-auto"
                  onClick={handleResolve}
                  disabled={resolving}
                >
                  {resolving ? 'Resolving…' : 'Auto-Resolve Conflicts'}
                </button>
              )}
            </div>
          </div>

          {/* Conflicts */}
          {result.conflict_count > 0 && (
            <div className="card overflow-hidden">
              <button
                className="w-full flex items-center justify-between px-5 py-3 border-b border-bg-border hover:bg-bg-elevated transition-colors"
                onClick={() => setShowConflicts(!showConflicts)}
              >
                <span className="text-sm font-semibold text-warning flex items-center gap-2">
                  <AlertTriangle size={15} />
                  {result.conflict_count} Conflict{result.conflict_count > 1 ? 's' : ''}
                </span>
                {showConflicts ? <ChevronUp size={16} className="text-text-muted" /> : <ChevronDown size={16} className="text-text-muted" />}
              </button>
              {showConflicts && (
                <div className="divide-y divide-bg-border">
                  {result.conflicts.map((c, i) => (
                    <div key={i} className="px-5 py-3 text-sm">
                      <div className="flex items-center gap-2">
                        <span className={c.type === 'Room Clash' ? 'badge-danger' : 'badge-warning'}>
                          {c.type}
                        </span>
                        <span className="text-text-muted font-mono text-xs">{c.slot}</span>
                      </div>
                      <p className="text-text-secondary mt-1.5 text-xs">
                        {c.type === 'Room Clash' && `Room ${c.room} — `}
                        {c.type === 'Faculty Overlap' && `${c.faculty} — `}
                        {c.subjects.join(' vs ')}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="text-xs text-text-muted text-center">
            Timetable saved to database. View it in the{' '}
            <a href="/timetable" className="text-accent-light underline">Timetable tab</a>.
          </div>
        </div>
      )}
    </div>
  )
}
