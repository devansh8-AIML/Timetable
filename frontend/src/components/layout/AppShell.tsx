import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  DoorOpen,
  BookOpen,
  CalendarDays,
  Sparkles,
  Menu,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

const NAV = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { label: 'Faculty', path: '/faculty', icon: Users },
  { label: 'Rooms', path: '/rooms', icon: DoorOpen },
  { label: 'Subjects', path: '/subjects', icon: BookOpen },
  { label: 'Generate', path: '/generate', icon: Sparkles },
  { label: 'Timetable', path: '/timetable', icon: CalendarDays },
]

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const location = useLocation()

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-bg-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
            <CalendarDays size={16} className="text-white" />
          </div>
          <div>
            <p className="font-semibold text-sm text-text-primary leading-tight">TimetableAI</p>
            <p className="text-[10px] text-text-muted">Genetic Scheduler</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-text-muted hover:text-text-primary lg:hidden">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        <p className="text-[10px] font-semibold text-text-muted uppercase tracking-widest px-3 py-2">
          Management
        </p>
        {NAV.slice(0, 4).map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            onClick={onClose}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-accent/15 text-accent-light border border-accent/25'
                  : 'text-text-secondary hover:bg-bg-elevated hover:text-text-primary',
              )
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}

        <p className="text-[10px] font-semibold text-text-muted uppercase tracking-widest px-3 py-2 mt-3">
          Scheduling
        </p>
        {NAV.slice(4).map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            onClick={onClose}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-accent/15 text-accent-light border border-accent/25'
                  : 'text-text-secondary hover:bg-bg-elevated hover:text-text-primary',
              )
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-bg-border">
        <div className="text-[11px] text-text-muted text-center">
          Genetic Algorithm v2.0
        </div>
      </div>
    </div>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-56 flex-shrink-0 bg-bg-surface border-r border-bg-border flex-col">
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-56 bg-bg-surface border-r border-bg-border z-50">
            <SidebarContent onClose={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile topbar */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 bg-bg-surface border-b border-bg-border">
          <button
            onClick={() => setMobileOpen(true)}
            className="text-text-secondary hover:text-text-primary"
          >
            <Menu size={20} />
          </button>
          <span className="font-semibold text-sm text-text-primary">TimetableAI</span>
        </div>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
