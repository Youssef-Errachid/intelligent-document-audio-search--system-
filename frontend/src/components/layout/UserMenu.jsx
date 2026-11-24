import { LogOut, Settings } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

function initials(name) {
    return name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0].toUpperCase())
        .join('') || '?'
}

export default function UserMenu() {
    const { user, logout } = useAuth()
    const [open, setOpen] = useState(false)
    const menuRef = useRef(null)
    const navigate = useNavigate()

    useEffect(() => {
        if (!open) return
        function handleClick(event) {
            if (!menuRef.current?.contains(event.target)) setOpen(false)
        }
        function handleKey(event) {
            if (event.key === 'Escape') setOpen(false)
        }
        document.addEventListener('mousedown', handleClick)
        document.addEventListener('keydown', handleKey)
        return () => {
            document.removeEventListener('mousedown', handleClick)
            document.removeEventListener('keydown', handleKey)
        }
    }, [open])

    if (!user) return null

    async function handleLogout() {
        setOpen(false)
        await logout()
        navigate('/login', { replace: true })
    }

    return (
        <div className="relative" ref={menuRef}>
            <button
                type="button"
                onClick={() => setOpen((current) => !current)}
                aria-label="Account menu"
                aria-expanded={open}
                className="flex size-12 items-center justify-center rounded-full border border-black/5 bg-white text-sm font-semibold text-slate-700 shadow-sm hover:text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
            >
                {initials(user.name)}
            </button>

            {open && (
                <div className="absolute right-0 top-14 z-50 w-64 overflow-hidden rounded-2xl border border-black/5 bg-white shadow-lg dark:border-white/10 dark:bg-[#111827]">
                    <div className="border-b border-black/5 px-4 py-3 dark:border-white/10">
                        <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                            {user.name}
                        </p>
                        <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                            {user.email}
                        </p>
                    </div>
                    <div className="p-1.5">
                        <Link
                            to="/settings"
                            onClick={() => setOpen(false)}
                            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5"
                        >
                            <Settings size={16} aria-hidden="true" />
                            Settings
                        </Link>
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                        >
                            <LogOut size={16} aria-hidden="true" />
                            Log out
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
