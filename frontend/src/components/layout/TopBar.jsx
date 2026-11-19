import { Bell, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import ThemeToggle from './ThemeToggle'

export default function TopBar({ title }) {
    return (
        <header className="flex shrink-0 items-center justify-between gap-4 px-1">
            <div className="flex min-w-0 items-center gap-4">
                {/* Temporary logo: replace with <img src="/logo.svg" /> when ready */}
                <img
                    src="/logo.webp"
                    alt="DocuMind AI"
                    className="size-12 shrink-0 object-contain lg:size-14"
                />
                <div className="min-w-0">
                    <p className="truncate text-[11px] font-medium uppercase tracking-wide text-slate-500">
                        DocuMind AI · Document &amp; Audio Assistant
                    </p>
                    <h1 className="truncate text-3xl font-light tracking-tight text-slate-900 lg:text-5xl">
                        {title}
                    </h1>
                </div>
            </div>

            <div className="flex shrink-0 items-center gap-3">
                <Link
                    to="/search"
                    aria-label="Search your files"
                    className="hidden items-center gap-3 rounded-full border border-black/5 bg-white py-3 pl-4 pr-3 text-sm text-slate-400 shadow-sm transition hover:text-slate-600 sm:flex sm:w-72"
                >
                    <Sparkles size={16} aria-hidden="true" />
                    <span className="flex-1">Search your files...</span>
                    <kbd className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
                        ⌘K
                    </kbd>

                </Link>
                <ThemeToggle />
                <button
                    type="button"
                    aria-label="Notifications"
                    className="relative flex size-12 items-center justify-center rounded-full border border-black/5 bg-white text-slate-600 shadow-sm hover:text-slate-900"
                >
                    <Bell size={18} aria-hidden="true" />
                </button>
            </div>
        </header>
    )
}