import { FileText, Upload } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import Pagination from '../components/common/Pagination'
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

function SkeletonRows() {
  return Array.from({ length: 5 }).map((_, index) => (
      <li key={index} className="flex animate-pulse items-start gap-4 px-5 py-4">
        <span className="size-10 shrink-0 rounded-full bg-slate-100" />
        <div className="flex-1 space-y-2.5 pt-1">
          <div className="h-3.5 w-1/3 rounded-full bg-slate-100" />
          <div className="h-3 w-3/4 rounded-full bg-slate-100" />
          <div className="h-3 w-1/4 rounded-full bg-slate-100" />
        </div>
      </li>
  ))
}

export default function Documents() {

  const [type, setType] = useState(null)
  const [page, setPage] = useState(0)
  const { items, total, error, isLoading } = useDocuments({
    type,
    page,
    pageSize: PAGE_SIZE,
  })

  const totalPages = Math.max(Math.ceil(total / PAGE_SIZE), 1)
  const activeFilter = filters.find((filter) => filter.value === type)
  const showEmpty = !isLoading && !error && items.length === 0

  const changeType = (value) => {
    setType(value)
    setPage(0) // a new filter starts again from the first page
  }

  return (
      <section className="mx-auto max-w-4xl space-y-6 py-2 sm:py-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              Your documents
            </h2>
            <p className="mt-1.5 text-sm text-slate-500">
              {isLoading
                  ? 'Loading...'
                  : `${total} item${total === 1 ? '' : 's'}${
                      type ? ` · ${activeFilter.label}` : ''
                  }`}
            </p>
          </div>

          <Link
              to="/upload/documents"
              className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-700"
          >
            <Upload size={16} aria-hidden="true" />
            Upload
          </Link>
        </div>

        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by type">
          {filters.map((filter) => (
              <button
                  key={filter.label}
                  type="button"
                  onClick={() => changeType(filter.value)}
                  aria-pressed={type === filter.value}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                      type === filter.value
                          ? 'bg-slate-900 text-white'
                          : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
              >
                {filter.label}
              </button>
          ))}
        </div>

        {error && (
            <div
                role="alert"
                className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >

              {error}
            </div>
        )}

        {showEmpty && (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-300 px-6 py-14 text-center">
                    <span className="flex size-14 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                        <FileText size={24} aria-hidden="true" />
                    </span>
              <p className="font-medium text-slate-900">No documents found</p>
              <p className="text-sm text-slate-500">
                {type
                    ? 'Try another file type.'
                    : 'Upload your first document to get started.'}
              </p>
              {!type && (
                  <Link
                      to="/upload/documents"
                      className="mt-1 inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-700"
                  >
                    <Upload size={16} aria-hidden="true" />
                    Upload document
                  </Link>
              )}
            </div>
        )}

        {!showEmpty && !error && (
            <ul
                aria-live="polite"
                aria-busy={isLoading}
                className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white"

            >
              {isLoading ? (
                  <SkeletonRows />
              ) : (
                  items.map((item) => <DocumentCard key={item.id} item={item} />)
              )}
            </ul>
        )}

        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </section>
  )
}