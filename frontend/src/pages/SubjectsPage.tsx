import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Plus, Trash2, BookOpen, Search, FlaskConical } from 'lucide-react'
import { getSubjects, addSubject, deleteSubject } from '@/lib/api'
import type { Subject } from '@/types'
import { DEPARTMENTS } from '@/lib/utils'

const EMPTY: Omit<Subject, 'id'> = {
  name: '',
  code: '',
  department: 'CSE',
  hours_per_week: 3,
  requires_lab: false,
}

export default function SubjectsPage() {
  const [list, setList] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [dept, setDept] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    getSubjects()
      .then(setList)
      .catch(() => toast.error('Failed to load subjects'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const filtered = list.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.code.toLowerCase().includes(search.toLowerCase())
    const matchDept = dept === 'all' || s.department === dept
    return matchSearch && matchDept
  })

  const handleAdd = async () => {
    if (!form.name.trim() || !form.code.trim()) {
      toast.error('Name and code are required')
      return
    }
    setSaving(true)
    try {
      const created = await addSubject(form)
      setList((prev) => [...prev, created])
      setForm(EMPTY)
      setShowForm(false)
      toast.success('Subject added')
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this subject?')) return
    try {
      await deleteSubject(id)
      setList((prev) => prev.filter((s) => s.id !== id))
      toast.success('Subject deleted')
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  const totalHours = list.reduce((sum, s) => sum + s.hours_per_week, 0)

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <BookOpen size={22} className="text-warning" /> Subjects
          </h1>
          <p className="text-text-secondary text-sm mt-1">Manage your course catalog</p>
        </div>
        <button className="btn-primary self-start" onClick={() => setShowForm(!showForm)}>
          <Plus size={16} /> Add Subject
        </button>
      </div>

      {/* Mini stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card p-4 text-center">
          <p className="text-xl font-bold text-text-primary font-mono">{list.length}</p>
          <p className="text-xs text-text-secondary mt-1">Total Subjects</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-xl font-bold text-text-primary font-mono">
            {list.filter((s) => s.requires_lab).length}
          </p>
          <p className="text-xs text-text-secondary mt-1">Lab Subjects</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-xl font-bold text-text-primary font-mono">{totalHours}</p>
          <p className="text-xs text-text-secondary mt-1">Total Hrs / Week</p>
        </div>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="card p-5 space-y-4 animate-slide-up border-warning/25">
          <h3 className="text-sm font-semibold text-text-primary">New Subject</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Subject Name *</label>
              <input
                className="input"
                placeholder="Data Structures"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Subject Code *</label>
              <input
                className="input font-mono"
                placeholder="CS201"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              />
            </div>
            <div>
              <label className="label">Department</label>
              <select
                className="input"
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
              >
                {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Hours / Week</label>
              <input
                className="input"
                type="number"
                min={1}
                max={10}
                value={form.hours_per_week}
                onChange={(e) => setForm({ ...form, hours_per_week: Number(e.target.value) })}
              />
            </div>
            <div className="flex items-center gap-2 col-span-full">
              <input
                id="lab"
                type="checkbox"
                checked={form.requires_lab}
                onChange={(e) => setForm({ ...form, requires_lab: e.target.checked })}
                className="rounded"
              />
              <label htmlFor="lab" className="text-sm text-text-secondary cursor-pointer flex items-center gap-1.5">
                <FlaskConical size={14} className="text-success" />
                Requires Lab Room
              </label>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="btn-primary" onClick={handleAdd} disabled={saving}>
              {saving ? 'Saving…' : 'Save Subject'}
            </button>
            <button className="btn-secondary" onClick={() => { setShowForm(false); setForm(EMPTY) }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            className="input pl-9"
            placeholder="Search name or code…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="input sm:w-44" value={dept} onChange={(e) => setDept(e.target.value)}>
          <option value="all">All Departments</option>
          {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-text-muted text-sm">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-text-muted text-sm">
            {list.length === 0 ? 'No subjects added yet.' : 'No results.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-bg-border bg-bg-elevated">
                  <th className="text-left px-4 py-3 text-text-muted font-medium">Code</th>
                  <th className="text-left px-4 py-3 text-text-muted font-medium">Name</th>
                  <th className="text-left px-4 py-3 text-text-muted font-medium">Department</th>
                  <th className="text-left px-4 py-3 text-text-muted font-medium">Hrs/Week</th>
                  <th className="text-left px-4 py-3 text-text-muted font-medium">Type</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr
                    key={s.id}
                    className="border-b border-bg-border last:border-0 hover:bg-bg-elevated/50 transition-colors"
                  >
                    <td className="px-4 py-3 font-mono text-accent-light font-medium">{s.code}</td>
                    <td className="px-4 py-3 text-text-primary font-medium">{s.name}</td>
                    <td className="px-4 py-3">
                      <span className="badge-muted">{s.department}</span>
                    </td>
                    <td className="px-4 py-3 text-text-secondary">{s.hours_per_week}h</td>
                    <td className="px-4 py-3">
                      {s.requires_lab ? (
                        <span className="badge-success">Lab</span>
                      ) : (
                        <span className="badge-accent">Lecture</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDelete(s.id)}
                        className="text-text-muted hover:text-danger transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
