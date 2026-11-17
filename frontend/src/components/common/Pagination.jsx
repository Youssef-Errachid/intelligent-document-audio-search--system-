import { ChevronLeft, ChevronRight } from 'lucide-react'

const buttonClass =
    'inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40'

export default function Pagination({ page, totalPages, onChange }) {
    if (totalPages <= 1) return null

    return (
        <nav aria-label="Pagination" className="flex items-center justify-between">
            <button
                type="button"
                onClick={() => onChange(page - 1)}
                disabled={page === 0}
                className={buttonClass}
            >
                <ChevronLeft size={16} aria-hidden="true" />
                Previous
            </button>

            <span className="text-sm text-slate-500">
                Page {page + 1} of {totalPages}
            </span>

            <button
                type="button"
                onClick={() => onChange(page + 1)}
                disabled={page + 1 >= totalPages}
                className={buttonClass}
            >
                Next
                <ChevronRight size={16} aria-hidden="true" />

            </button>
        </nav>
    )
}