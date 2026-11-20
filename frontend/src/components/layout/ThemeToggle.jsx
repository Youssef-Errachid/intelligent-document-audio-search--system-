import { Moon, Sun } from 'lucide-react'
import useTheme from '../../hooks/useTheme'

const OPTIONS = [
    { value: 'light', label: 'Light mode', Icon: Sun },
    { value: 'dark', label: 'Dark mode', Icon: Moon },
]

export default function ThemeToggle() {
    const { theme, setTheme } = useTheme()

    return (
        <div
            role="group"
            aria-label="Theme"
            className="flex rounded-full border border-black/5 bg-white p-1 shadow-sm"
        >
            {OPTIONS.map(({ value, label, Icon }) => (
                <button
                    key={value}
                    type="button"
                    onClick={() => setTheme(value)}
                    aria-pressed={theme === value}
                    aria-label={label}
                    title={label}
                    className={`flex size-9 items-center justify-center rounded-full transition-colors ${
                        theme === value
                            ? 'bg-slate-900 text-white'
                            : 'text-slate-400 hover:text-slate-900'
                    }`}
                >
                    <Icon size={17} aria-hidden="true" />

                </button>
            ))}
        </div>
    )
}