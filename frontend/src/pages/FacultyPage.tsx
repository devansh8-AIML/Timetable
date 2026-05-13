import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Plus, Trash2, ToggleLeft, ToggleRight, Users, Search } from 'lucide-react'
import { getFaculty, addFaculty, deleteFaculty, toggleLeave } from '@/lib/api'
import type { Faculty } from '@/types'
import { DEPARTMENTS } from '@/lib/utils'

const EMPTY: Omit<Faculty, 'id'> = {
  name: '',
  department: 'CSE',
  subjects: '',
  max_hours: 20,
  on_leave: false,
}

export default function FacultyPage() {
  const [list, setList] = useState<Faculty[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [dept, setDept] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    getFaculty()
      .then(setList)
      .catch(() => toast.error('Failed to load faculty'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const filtered = list.filter((f) => {
    const matchSearch = f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.subjects.toLowerCase().includes(search.toLowerCase())
    const matchDept = dept === 'all' || f.department === dept
    return matchSearch && matchDept
  })

  const handleAdd = async () => {
    if (!form.name.trim() || !form.subjects.trim()) {
      toast.error('Name and subjects are required')
      return
    }
    setSaving(true)
    try {
      const created = await addFaculty(form)
      setList((prev) => [...prev, created])
      setForm(EMPTY)
      setShowForm(false)
      toast.success('Faculty added')
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this faculty member?')) return
    try {
      await deleteFaculty(id)
      setList((prev) => prev.filter((f) => f.id !== id))
      toast.success('Faculty deleted')
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  const handleToggle = async (id: number) => {
    try {
      const res = await toggleLeave(id)
      setList((prev) =>
        prev.map((f) => (f.id === id ? { ...f, on_leave: res.on_leave } : f)),
      )
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <Users size={22} className="text-accent-light" /> Faculty
          </h1>
          <p className="text-text-secondary text-sm mt-1">Manage lecturers and professors</p>
        </div>
        <button className="btn-primary self-start" onClick={() => setShowForm(!showForm)}>
          <Plus size={16} /> Add Faculty
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="card p-5 space-y-4 animate-slide-up border-accent/25">
          <h3 className="text-sm font-semibold text-text-primary">New Faculty Member</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Full Name *</label>
              <input
                className="input"
                placeholder="Dr. Anika Sharma"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Department *</label>
              <select
                className="input"
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Subject Codes * (comma-separated)</label>
              <input
                className="input"
                placeholder="CS101,CS201,CS301"
                value={form.subjects}
                onChange={(e) => setForm({ ...form, subjects: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Max Hours / Week</label>
              <input
                className="input"
                type="number"
                min={1}
                max={40}
                value={form.max_hours}
                onChange={(e) => setForm({ ...form, max_hours: Number(e.target.value) })}
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button className="btn-primary" onClick={handleAdd} disabled={saving}>
              {saving ? 'Saving…' : 'Save Faculty'}
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
            placeholder="Search faculty or subjects…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="input sm:w-44"
          value={dept}
          onChange={(e) => setDept(e.target.value)}
        >
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
            {list.length === 0 ? 'No faculty added yet.' : 'No results match your filters.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-bg-border bg-bg-elevated">
                  <th className="text-left px-4 py-3 text-text-muted font-medium">Name</th>
                  <th className="text-left px-4 py-3 text-text-muted font-medium">Department</th>
                  <th className="text-left px-4 py-3 text-text-muted font-medium">Subjects</th>
                  <th className="text-left px-4 py-3 text-text-muted font-medium">Max Hrs</th>
                  <th className="text-left px-4 py-3 text-text-muted font-medium">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((f, i) => (
                  <tr
                    key={f.id}
                    className="border-b border-bg-border last:border-0 hover:bg-bg-elevated/50 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-text-primary">{f.name}</td>
                    <td className="px-4 py-3">
                      <span className="badge-accent">{f.department}</span>
                    </td>
                    <td className="px-4 py-3 text-text-secondary font-mono text-xs">
                      {f.subjects}
                    </td>
                    <td className="px-4 py-3 text-text-secondary">{f.max_hours}h</td>
                    <td className="px-4 py-3">
                      {f.on_leave ? (
                        <span className="badge-warning">On Leave</span>
                      ) : (
                        <span className="badge-success">Active</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => handleToggle(f.id)}
                          className="text-text-muted hover:text-warning transition-colors"
                          title="Toggle leave"
                        >
                          {f.on_leave ? <ToggleLeft size={18} /> : <ToggleRight size={18} />}
                        </button>
                        <button
                          onClick={() => handleDelete(f.id)}
                          className="text-text-muted hover:text-danger transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Count */}
      {!loading && (
        <p className="text-xs text-text-muted">
          Showing {filtered.length} of {list.length} faculty members
        </p>
      )}
    </div>
  )
}
