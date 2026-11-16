import { NavLink } from 'react-router-dom'
import { navigationItems } from '../../constants/navigation'

export default function IconRail() {
    return (
        <aside
            aria-label="Primary navigation"
            className="fixed inset-x-4 bottom-4 z-40 flex items-center justify-around rounded-full border border-black/5 bg-white p-2 shadow-sm lg:static lg:inset-auto lg:w-[72px] lg:shrink-0 lg:flex-col lg:justify-start lg:gap-3 lg:rounded-[32px] lg:px-3 lg:py-5"
        >
            <nav className="flex items-center gap-1 lg:flex-1 lg:flex-col lg:gap-3">
                {navigationItems.map(({ label, to, icon: Icon, end }) => (
                    <NavLink
                        key={to}
                        to={to}
                        end={end}
                        title={label}
                        aria-label={label}
                        className={({ isActive }) =>
                            `flex size-11 items-center justify-center rounded-2xl transition-colors ${
                                isActive
                                    ? 'bg-slate-900 text-white shadow-sm'
                                    : 'text-slate-400 hover:bg-slate-100 hover:text-slate-900'
                            }`
                        }
                    >
                        <Icon size={21} strokeWidth={1.75} aria-hidden="true" />
                    </NavLink>
                ))}
            </nav>

            <div

                title="Mouad"
                className="relative hidden size-11 items-center justify-center rounded-full bg-orange-100 text-sm font-semibold text-orange-700 lg:flex"
            >
                M
                <span className="absolute bottom-0 right-0 size-3 rounded-full border-2 border-white bg-emerald-500" />
            </div>
        </aside>
    )
}