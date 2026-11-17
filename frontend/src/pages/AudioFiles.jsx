import { FileAudio, Search, Upload } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import Pagination from '../components/common/Pagination'
import DocumentList from '../components/documents/DocumentList'
import useDocuments from '../hooks/useDocuments'

const PAGE_SIZE = 10

export default function AudioFiles() {
    const [page, setPage] = useState(0)
    const { items, total, error, isLoading } = useDocuments({
        type: 'audio',
        page,
        pageSize: PAGE_SIZE,
    })

    const totalPages = Math.max(Math.ceil(total / PAGE_SIZE), 1)

    return (
        <section className="mx-auto max-w-4xl space-y-6 py-2 sm:py-4">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                        Audio files
                    </h2>
                    <p className="mt-1.5 text-sm text-slate-500">
                        {isLoading
                            ? 'Loading...'
                            : `${total} recording${total === 1 ? '' : 's'} with their transcripts`}
                    </p>
                </div>


                <div className="flex items-center gap-2">
                    <Link
                        to="/search"
                        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                        <Search size={16} aria-hidden="true" />
                        Search transcripts
                    </Link>
                    <Link
                        to="/upload?type=audio"
                        className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-700"
                    >
                        <Upload size={16} aria-hidden="true" />
                        Upload audio
                    </Link>
                </div>
            </div>

            <DocumentList
                items={items}
                isLoading={isLoading}
                error={error}
                hideType
                empty={{
                    Icon: FileAudio,
                    title: 'No audio files yet',
                    hint: 'Upload a recording to see its transcript here.',
                    actionTo: '/upload?type=audio',
                    actionLabel: 'Upload audio',
                }}
            />


            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </section>
    )
}