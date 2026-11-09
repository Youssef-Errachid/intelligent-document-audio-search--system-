import { Menu, Search, UserCircle } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Header({ title, isSidebarOpen, onMenuClick }) {
  return (
    <header className="flex h-24 shrink-0 items-center justify-between border-b border-slate-200/70 bg-white/75 px-4 backdrop-blur-xl sm:px-6 lg:px-10">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
          aria-expanded={isSidebarOpen}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 lg:hidden"
        >
          <Menu size={22} aria-hidden="true" />
        </button>
        <div>
          <p className="hidden text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400 sm:block">Workspace</p>
          <h1 className="truncate text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
          {title}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <Link
          to="/search"
          aria-label="Go to search"
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-slate-500 shadow-sm transition-colors hover:border-brand-100 hover:bg-brand-50 hover:text-brand-700 sm:px-3"
        >
          <Search size={17} aria-hidden="true" />
          <span className="hidden text-sm font-medium sm:inline">Search</span>
          <kbd className="hidden rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-medium text-slate-400 md:inline">
            /
          </kbd>
        </Link>
        <div className="hidden h-8 w-px bg-slate-200 sm:block" />
        <button
          type="button"
          aria-label="User profile"
          className="flex items-center gap-2 rounded-lg p-1.5 text-slate-600 hover:bg-slate-50"
        >
          <span className="flex size-9 items-center justify-center rounded-full bg-slate-950 text-white">
            <UserCircle size={21} aria-hidden="true" />
          </span>
          <span className="hidden text-sm font-medium text-slate-700 md:inline">
            Workspace user
          </span>
        </button>
      </div>
    </header>
  )
}
