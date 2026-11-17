import { FileText, Upload } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import Pagination from '../components/common/Pagination'
import DocumentList from '../components/documents/DocumentList'
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
    const activeFilter = filters.find((filter) => filter.value === type)

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
                    to="/upload?type=documents"
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

            <DocumentList
                items={items}
                isLoading={isLoading}
                error={error}
                empty={{
                    Icon: FileText,
                    title: 'No documents found',
                    hint: type
                        ? 'Try another file type.'
                        : 'Upload your first document to get started.',
                    actionTo: type ? undefined : '/upload?type=documents',
                    actionLabel: 'Upload document',
                }}
            />

            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </section>
    )
}