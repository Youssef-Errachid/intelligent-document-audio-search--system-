import { BrainCircuit, ChevronRight, X } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { navigationItems } from '../../constants/navigation'

export default function Sidebar({ isOpen, onClose }) {
  return (
    <aside
      aria-label="Primary navigation"
      className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-200/80 bg-white/95 shadow-xl shadow-slate-900/5 backdrop-blur-xl transition-transform duration-200 lg:static lg:z-auto lg:translate-x-0 lg:shadow-none ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex h-24 items-center justify-between border-b border-slate-100 px-6">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-950/15">
              <BrainCircuit size={21} aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-bold tracking-tight text-slate-950">DocuMind</p>
              <p className="text-[11px] font-medium text-slate-400">Intelligence workspace</p>
            </div>
          </div>
          <button
          type="button"
          onClick={onClose}
          aria-label="Close navigation menu"
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 lg:hidden"
        >
          <X size={20} aria-hidden="true" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 px-4 py-7">
        <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
          Workspace
        </p>
        {navigationItems.map(({ label, to, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onClose}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-slate-950 text-white shadow-lg shadow-slate-950/10'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-950'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={19}
                  strokeWidth={isActive ? 2.25 : 2}
                  aria-hidden="true"
                />
                <span>{label}</span>
                {isActive && <ChevronRight className="ml-auto opacity-70" size={15} aria-hidden="true" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="m-4 rounded-2xl bg-slate-950 p-4 text-white">
        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="size-2 rounded-full bg-emerald-400" />
          Workspace services
        </div>
        <p className="mt-2 text-xs leading-5 text-slate-400">
          Search, extraction, and transcription are available through the connected backend.
        </p>
      </div>
    </aside>
  )
}
