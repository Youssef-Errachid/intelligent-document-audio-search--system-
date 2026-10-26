import SearchBar from '../components/search/SearchBar'
import SearchResult from '../components/search/SearchResult'
import useSearch from '../hooks/useSearch'

export default function Search() {
  const { results, isLoading, error, hasSearched, search } = useSearch()
  const showEmpty = hasSearched && !isLoading && !error && results.length === 0

  return (
      <section className="mx-auto max-w-3xl space-y-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">
            Discover
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            Search your knowledge
          </h2>
          <p className="mt-2 text-base leading-7 text-slate-500">
            Search across your documents and audio transcripts from one focused
            workspace.
          </p>
        </div>

        <SearchBar onSearch={search} isLoading={isLoading} />

        {error && (
            <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </div>
        )}

        {showEmpty && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
              No results found. Try a different keyword.
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