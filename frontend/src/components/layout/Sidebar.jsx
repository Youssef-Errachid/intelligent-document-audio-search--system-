import { BrainCircuit, X } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { navigationItems } from '../../constants/navigation'

export default function Sidebar({ isOpen, onClose }) {
  return (
    <aside
      aria-label="Primary navigation"
      className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:static lg:z-auto lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex h-20 items-center justify-between border-b border-slate-100 px-6">
        <NavLink to="/" className="flex items-center gap-3" onClick={onClose}>
          <span className="flex size-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-200">
            <BrainCircuit size={22} strokeWidth={2.25} aria-hidden="true" />
          </span>
          <span className="text-lg font-bold tracking-tight text-slate-900">
            DocuMind <span className="text-indigo-600">AI</span>
          </span>
        </NavLink>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close navigation menu"
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 lg:hidden"
        >
          <X size={20} aria-hidden="true" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 px-4 py-6">
        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
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
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
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
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
