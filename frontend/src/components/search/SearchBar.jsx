import { Search } from 'lucide-react'
import { useState } from 'react'

const MIN_LENGTH = 2 // same rule as the backend (min_length=2)

export default function SearchBar({ onSearch, isLoading }) {
    const [value, setValue] = useState('')
    const trimmed = value.trim()
    const canSubmit = trimmed.length >= MIN_LENGTH

    const handleSubmit = (event) => {
        event.preventDefault()
        if (canSubmit) onSearch(trimmed)
    }

    return (
        <form onSubmit={handleSubmit} role="search" className="flex gap-3">
            <div className="relative flex-1">
                <Search
                    size={18}
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                    type="search"
                    value={value}
                    onChange={(event) => setValue(event.target.value)}
                    placeholder="Search documents and audio..."
                    aria-label="Search"
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                />
            </div>
            <button
                type="submit"
                disabled={!canSubmit}
                className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
                {isLoading ? 'Searching...' : 'Search'}
            </button>
        </form>
    )
}