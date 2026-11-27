import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function RequireAuth({ children }) {
    const { user, loading } = useAuth()
    const location = useLocation()

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gradient-to-br from-[#ececee] to-[#f7f7f8] dark:from-[#0a0d14] dark:to-[#0f1420]">
                <div className="flex flex-col items-center gap-4">
                    <div className="size-10 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700 dark:border-slate-700 dark:border-t-slate-300" />
                    <p className="text-sm text-slate-500">Restoring your session...</p>
                </div>
            </div>
        )
    }

    if (!user) {
        return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
    }

    return children
}
