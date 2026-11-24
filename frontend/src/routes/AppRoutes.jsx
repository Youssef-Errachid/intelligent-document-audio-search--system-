import { Navigate, Route, Routes } from 'react-router-dom'
import MainLayout from '../components/layout/MainLayout'
import AudioFiles from '../pages/AudioFiles'
import ChatHome from '../pages/ChatHome'
import Documents from '../pages/Documents'
import Login from '../pages/Login'
import NotFound from '../pages/NotFound'
import Register from '../pages/Register'
import Search from '../pages/Search'
import Settings from '../pages/Settings'
import UploadFiles from '../pages/UploadFiles'
import RequireAuth from './RequireAuth'

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route element={<RequireAuth><MainLayout /></RequireAuth>}>
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
