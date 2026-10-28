import { ChevronLeft, ChevronRight, Upload } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import DocumentCard from '../components/documents/DocumentCard'
import useDocuments from '../hooks/useDocuments'

const PAGE_SIZE = 10

const filters = [
  { label: 'All', value: null },
  { label: 'PDF', value: 'pdf' },
  { label: 'DOCX', value: 'docx' },
  { label: 'CSV', value: 'csv' },
  { label: 'XML', value: 'xml' },
  { label: 'Audio', value: 'audio' },
]

export default function Documents() {
  const [type, setType] = useState(null)
  const [page, setPage] = useState(0)
  const { items, total, error, isLoading } = useDocuments({
    type,
    page,
    pageSize: PAGE_SIZE,
  })

  const totalPages = Math.max(Math.ceil(total / PAGE_SIZE), 1)

  const changeType = (value) => {
    setType(value)
    setPage(0) // a new filter starts again from the first page
  }

  return (
      <section className="mx-auto max-w-4xl space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">
              Library
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Documents
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              {isLoading ? 'Loading...' : `${total} item${total === 1 ? '' : 's'}`}
            </p>
          </div>
          <Link
              to="/audio/upload"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
          >
            <Upload size={16} aria-hidden="true" />
            Upload document
          </Link>
        </div>

        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by type">
          {filters.map((filter) => (
              <button
                  key={filter.label}
                  type="button"
                  onClick={() => changeType(filter.value)}
                  aria-pressed={type === filter.value}
                  className={`rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors ${
                      type === filter.value
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
                  }`}
              >
                {filter.label}
              </button>
          ))}
        </div>

        {error && (
            <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </div>
        )}

        {!isLoading && !error && items.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
              No documents found.
            </div>
        )}

        <div className="space-y-3" aria-live="polite">
          {items.map((item) => (
              <DocumentCard key={item.id} item={item} />
          ))}
        </div>

        {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <button
                  type="button"
                  onClick={() => setPage((current) => current - 1)}
                  disabled={page === 0}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronLeft size={16} aria-hidden="true" />
                Previous
              </button>
              <span className="text-sm text-slate-500">
            Page {page + 1} of {totalPages}
          </span>
              <button
                  type="button"
                  onClick={() => setPage((current) => current + 1)}
                  disabled={page + 1 >= totalPages}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
                <ChevronRight size={16} aria-hidden="true" />
              </button>
            </div>
        )}
      </section>
  )
}