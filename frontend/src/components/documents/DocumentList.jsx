import { Upload } from 'lucide-react'
import { Link } from 'react-router-dom'
import DocumentCard from './DocumentCard'

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

// empty = { Icon, title, hint, actionTo?, actionLabel? }
export default function DocumentList({ items, isLoading, error, hideType = false, empty }) {
    const showEmpty = !isLoading && !error && items.length === 0
    const { Icon, title, hint, actionTo, actionLabel } = empty

    return (
        <>
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
                        <Icon size={24} aria-hidden="true" />
                    </span>
                    <p className="font-medium text-slate-900">{title}</p>
                    <p className="text-sm text-slate-500">{hint}</p>
                    {actionTo && (
                        <Link
                            to={actionTo}
                            className="mt-1 inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-700"
                        >
                            <Upload size={16} aria-hidden="true" />
                            {actionLabel}
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
                        items.map((item) => (
                            <DocumentCard key={item.id} item={item} hideType={hideType} />
                        ))
                    )}
                </ul>
            )}
        </>
    )
}