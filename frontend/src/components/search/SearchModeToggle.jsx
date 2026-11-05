const MODES = [
    {
        value: 'hybrid',
        label: 'Hybrid',
        hint: 'Combines exact words and meaning. Best for most searches.',
    },
    {
        value: 'keyword',
        label: 'Keywords',
        hint: 'Exact words only. Best for names, codes and IDs.',
    },
    {
        value: 'semantic',
        label: 'Meaning',
        hint: 'Finds related ideas, even with other words or in another language.',
    },
]

export default function SearchModeToggle({ mode, onChange }) {
    const current = MODES.find((item) => item.value === mode)

    return (
        <div>
            <div
                role="group"
                aria-label="Search mode"
                className="inline-flex rounded-xl bg-slate-100 p-1"
            >
                {MODES.map((item) => (
                    <button
                        key={item.value}
                        type="button"

                        onClick={() => onChange(item.value)}
                        aria-pressed={mode === item.value}
                        className={`rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors ${
                            mode === item.value
                                ? 'bg-white text-indigo-700 shadow-sm'
                                : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        {item.label}
                    </button>
                ))}
            </div>
            <p className="mt-2 text-xs text-slate-500">{current?.hint}</p>
        </div>
    )
}