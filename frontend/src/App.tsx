import { Routes, Route } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import DashboardPage from '@/pages/DashboardPage'
import FacultyPage from '@/pages/FacultyPage'
import RoomsPage from '@/pages/RoomsPage'
import SubjectsPage from '@/pages/SubjectsPage'
import GeneratePage from '@/pages/GeneratePage'
import TimetablePage from '@/pages/TimetablePage'

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/faculty" element={<FacultyPage />} />
        <Route path="/rooms" element={<RoomsPage />} />
        <Route path="/subjects" element={<SubjectsPage />} />
        <Route path="/generate" element={<GeneratePage />} />
        <Route path="/timetable" element={<TimetablePage />} />
        <Route
          path="*"
          element={
            <div className="p-12 text-center text-text-muted">
              404 — Page not found
            </div>
          }
        />
      </Routes>
    </AppShell>
  )
}
