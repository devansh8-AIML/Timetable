import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Plus, Trash2, DoorOpen, Search, FlaskConical, BookOpen } from 'lucide-react'
import { getRooms, addRoom, deleteRoom } from '@/lib/api'
import type { Room } from '@/types'

const EMPTY: Omit<Room, 'id'> = {
  number: '',
  capacity: 30,
  room_type: 'Classroom',
  is_available: true,
}

export default function RoomsPage() {
  const [list, setList] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    getRooms()
      .then(setList)
      .catch(() => toast.error('Failed to load rooms'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const filtered = list.filter((r) => {
    const matchSearch = r.number.toLowerCase().includes(search.toLowerCase())
    const matchType = typeFilter === 'all' || r.room_type === typeFilter
    return matchSearch && matchType
  })

  const handleAdd = async () => {
    if (!form.number.trim()) { toast.error('Room number is required'); return }
    setSaving(true)
    try {
      const created = await addRoom(form)
      setList((prev) => [...prev, created])
      setForm(EMPTY)
      setShowForm(false)
      toast.success('Room added')
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this room?')) return
    try {
      await deleteRoom(id)
      setList((prev) => prev.filter((r) => r.id !== id))
      toast.success('Room deleted')
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  const classrooms = list.filter((r) => r.room_type === 'Classroom').length
  const labs = list.filter((r) => r.room_type === 'Lab').length

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <DoorOpen size={22} className="text-success" /> Rooms
          </h1>
          <p className="text-text-secondary text-sm mt-1">Manage classrooms and labs</p>
        </div>
        <button className="btn-primary self-start" onClick={() => setShowForm(!showForm)}>
          <Plus size={16} /> Add Room
        </button>
      </div>

      {/* Mini stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card p-4 flex items-center gap-3">
          <div className="stat-icon bg-accent/15 text-accent-light"><BookOpen size={16} /></div>
          <div>
            <p className="text-xl font-bold text-text-primary font-mono">{classrooms}</p>
            <p className="text-xs text-text-secondary">Classrooms</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <div className="stat-icon bg-success/15 text-success"><FlaskConical size={16} /></div>
          <div>
            <p className="text-xl font-bold text-text-primary font-mono">{labs}</p>
            <p className="text-xs text-text-secondary">Labs</p>
          </div>
        </div>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="card p-5 space-y-4 animate-slide-up border-success/25">
          <h3 className="text-sm font-semibold text-text-primary">New Room</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Room Number *</label>
              <input
                className="input"
                placeholder="101"
                value={form.number}
                onChange={(e) => setForm({ ...form, number: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Capacity</label>
              <input
                className="input"
                type="number"
                min={1}
                value={form.capacity}
                onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="label">Type</label>
              <select
                className="input"
                value={form.room_type}
                onChange={(e) => setForm({ ...form, room_type: e.target.value })}
              >
                <option value="Classroom">Classroom</option>
                <option value="Lab">Lab</option>
              </select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_available}
                  onChange={(e) => setForm({ ...form, is_available: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm text-text-secondary">Available</span>
              </label>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="btn-primary" onClick={handleAdd} disabled={saving}>
              {saving ? 'Saving…' : 'Save Room'}
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
            placeholder="Search room number…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="input sm:w-44" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="all">All Types</option>
          <option value="Classroom">Classrooms</option>
          <option value="Lab">Labs</option>
        </select>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="p-12 text-center text-text-muted text-sm">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center text-text-muted text-sm">
          {list.length === 0 ? 'No rooms added yet.' : 'No results.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filtered.map((room) => (
            <div
              key={room.id}
              className="card p-4 flex flex-col gap-3 hover:border-bg-border/80 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold text-text-primary text-lg font-mono">
                    {room.room_type === 'Lab' ? '🔬' : '🏫'} {room.number}
                  </p>
                  <span className={room.room_type === 'Lab' ? 'badge-success mt-1' : 'badge-accent mt-1'}>
                    {room.room_type}
                  </span>
                </div>
                <button
                  onClick={() => handleDelete(room.id)}
                  className="text-text-muted hover:text-danger transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="text-xs text-text-secondary space-y-1">
                <p>Capacity: <span className="text-text-primary font-medium">{room.capacity}</span></p>
                <p>
                  Status:{' '}
                  {room.is_available ? (
                    <span className="text-success font-medium">Available</span>
                  ) : (
                    <span className="text-danger font-medium">Unavailable</span>
                  )}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
