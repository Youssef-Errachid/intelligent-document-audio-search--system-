import { Navigate, Route, Routes } from 'react-router-dom'
import MainLayout from '../components/layout/MainLayout'
import Assistant from '../pages/Assistant'
import AudioFiles from '../pages/AudioFiles'
import Dashboard from '../pages/Dashboard'
import Documents from '../pages/Documents'
import NotFound from '../pages/NotFound'
import Search from '../pages/Search'
import Settings from '../pages/Settings'

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="search" element={<Search />} />
        <Route path="documents" element={<Documents />} />
        <Route path="audio" element={<AudioFiles />} />
        <Route path="assistant" element={<Assistant />} />
        <Route path="settings" element={<Settings />} />
        <Route path="404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Route>
    </Routes>
  )
}
