import { Search as SearchIcon, Sparkles } from 'lucide-react'
import { useState } from 'react'
import SearchBar from '../components/search/SearchBar'
import SearchModeToggle from '../components/search/SearchModeToggle'
import SearchResult from '../components/search/SearchResult'
import useSearch from '../hooks/useSearch'

const EXAMPLES = ['الذكر الحكيم', 'النشيد الوطني', 'دليل البث']

export default function Search() {
    const [mode, setMode] = useState('hybrid')
    const [value, setValue] = useState('')
    const [lastQuery, setLastQuery] = useState('')
    const { results, usedMode, isLoading, error, hasSearched, search } = useSearch()

    const isSettled = hasSearched && !isLoading && !error
    const showEmpty = isSettled && results.length === 0
    const showFallback = isSettled && usedMode && usedMode !== mode

    const handleSearch = (query) => {
        setLastQuery(query)
        search(query, mode)
    }

    const runExample = (text) => {
        setValue(text)
        handleSearch(text)
    }

    const changeMode = (newMode) => {
        if (newMode === mode) return
        setMode(newMode)

        if (lastQuery) search(lastQuery, newMode)
    }

    return (
        <section className="mx-auto flex max-w-3xl flex-col gap-6 py-2 sm:py-6">
            <div className="text-center">
                <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                    Search your knowledge
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                    Find words or meaning across your documents and audio transcripts.
                </p>
            </div>

            <SearchBar
                value={value}
                onChange={setValue}
                onSubmit={handleSearch}
                isLoading={isLoading}
            />
            <SearchModeToggle mode={mode} onChange={changeMode} />

            {error && (
                <div
                    role="alert"
                    className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                    {error}
                </div>
            )}

            {showFallback && (

                <div
                    role="status"
                    className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
                >
                    Meaning search is unavailable right now. Showing keyword results only.
                </div>
            )}

            {!hasSearched && !isLoading && (
                <div className="flex flex-col items-center gap-4 pt-6 text-center">
                    <span className="flex size-14 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                        <SearchIcon size={24} aria-hidden="true" />
                    </span>
                    <p className="text-sm text-slate-500">
                        Type a word or a question, or try an example:
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                        {EXAMPLES.map((text) => (
                            <button
                                key={text}
                                type="button"
                                onClick={() => runExample(text)}
                                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                            >
                                <Sparkles size={14} className="text-orange-500" aria-hidden="true" />
                                <span dir="auto">{text}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}


            {showEmpty && (
                <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
                    No results found. Try different words or another search mode.
                </div>
            )}

            {isSettled && results.length > 0 && (
                <p className="px-1 text-xs font-medium text-slate-400">
                    {results.length} result{results.length === 1 ? '' : 's'}
                </p>
            )}

            <div className="space-y-3" aria-live="polite">
                {results.map((result) => (
                    <SearchResult key={result.id} result={result} />
                ))}
            </div>
        </section>
    )
}