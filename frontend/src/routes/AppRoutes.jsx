import { Navigate, Route, Routes } from 'react-router-dom'
import MainLayout from '../components/layout/MainLayout'
import AudioFiles from '../pages/AudioFiles'
import ChatHome from '../pages/ChatHome'
import Documents from '../pages/Documents'
import NotFound from '../pages/NotFound'
import Search from '../pages/Search'
import Settings from '../pages/Settings'
import UploadFiles from '../pages/UploadFiles'

export default function AppRoutes() {
    return (
        <Routes>
            <Route element={<MainLayout />}>
                <Route index element={<ChatHome />} />
                <Route path="assistant" element={<Navigate to="/" replace />} />
                <Route path="search" element={<Search />} />
                <Route path="documents" element={<Documents />} />
                <Route path="audio" element={<AudioFiles />} />
                <Route path="upload" element={<UploadFiles />} />
                {/* old links still work */}
                <Route path="upload/documents" element={<Navigate to="/upload?type=documents" replace />} />
                <Route path="audio/upload" element={<Navigate to="/upload?type=audio" replace />} />
                <Route path="settings" element={<Settings />} />
                <Route path="404" element={<NotFound />} />
                <Route path="*" element={<Navigate to="/404" replace />} />
            </Route>
        </Routes>
    )
}