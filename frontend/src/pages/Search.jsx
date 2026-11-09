import { useState } from 'react'
import SearchBar from '../components/search/SearchBar'
import SearchModeToggle from '../components/search/SearchModeToggle'
import SearchResult from '../components/search/SearchResult'
import useSearch from '../hooks/useSearch'

export default function Search() {
    const [mode, setMode] = useState('hybrid')
    const [lastQuery, setLastQuery] = useState('')
    const { results, usedMode, isLoading, error, hasSearched, search } = useSearch()

    const isSettled = hasSearched && !isLoading && !error
    const showEmpty = isSettled && results.length === 0
    const showFallback = isSettled && usedMode && usedMode !== mode

    const handleSearch = (query) => {
        setLastQuery(query)
        search(query, mode)
    }

    const changeMode = (newMode) => {
        if (newMode === mode) return
        setMode(newMode)
        if (lastQuery) search(lastQuery, newMode)
    }

    return (
        <section className="mx-auto max-w-5xl space-y-6">
            <div>
                <p className="eyebrow">
                    Discover

                </p>
                <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                    Search your knowledge
                </h2>
                <p className="mt-2 text-base leading-7 text-slate-500">
                    Search across your documents and audio transcripts from one focused
                    workspace.
                </p>
            </div>

            <SearchBar onSearch={handleSearch} isLoading={isLoading} />
            <SearchModeToggle mode={mode} onChange={changeMode} />

            {error && (
                <div
                    role="alert"
                    className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                    {error}
                </div>
            )}

            {showFallback && (
                <div
                    role="status"
                    className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
                >
                    Meaning search is unavailable right now. Showing keyword results only.
                </div>
            )}

            {showEmpty && (

                <div className="surface rounded-2xl border-dashed p-10 text-center text-sm text-slate-500">
                    No results found. Try different words or another search mode.
                </div>
            )}

            <div className="space-y-3" aria-live="polite">
                {results.map((result) => (
                    <SearchResult key={result.id} result={result} />
                ))}
            </div>
        </section>
    )
}