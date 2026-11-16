import { ArrowRight, Loader2, Search } from 'lucide-react'

const MIN_LENGTH = 2 // same rule as the backend (min_length=2)

export default function SearchBar({ value, onChange, onSubmit, isLoading }) {
    const trimmed = value.trim()
    const canSubmit = trimmed.length >= MIN_LENGTH && !isLoading

    const handleSubmit = (event) => {
        event.preventDefault()
        if (canSubmit) onSubmit(trimmed)
    }

    return (
        <form
            onSubmit={handleSubmit}
            role="search"
            className="flex items-center gap-2 rounded-full border border-slate-200 bg-white py-2 pl-5 pr-2 shadow-sm transition focus-within:border-slate-300 focus-within:ring-4 focus-within:ring-slate-100"
        >
            <Search size={18} aria-hidden="true" className="shrink-0 text-slate-400" />
            <input
                type="search"
                dir="auto"
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder="Search documents and audio..."
                aria-label="Search"
                className="min-w-0 flex-1 bg-transparent px-1 text-sm text-slate-900 outline-none placeholder:text-slate-400"
            />
            <button
                type="submit"
                disabled={!canSubmit}

                aria-label="Search"
                className="flex h-11 shrink-0 items-center gap-2 rounded-full bg-slate-900 px-5 text-sm font-medium text-white transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
                {isLoading ? (
                    <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                ) : (
                    <ArrowRight size={16} aria-hidden="true" />
                )}
                <span className="hidden sm:inline">{isLoading ? 'Searching' : 'Search'}</span>
            </button>
        </form>
    )
}