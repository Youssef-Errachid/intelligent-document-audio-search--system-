import { useRef, useState } from 'react'
import {
    AlertCircle,
    AudioLines,
    CheckCircle2,
    Clock3,
    Copy,
    FileAudio,
    Loader2,
    X,
} from 'lucide-react'
import Pagination from '../components/common/Pagination'
import useUploadQueue from '../hooks/useUploadQueue'
import { uploadAudio } from '../services/audioService'

const ACCEPTED_TYPES = [
    '.wav', '.mp3', '.m4a', '.flac', '.ogg', '.aac', '.wma',
    '.mp4', '.mpeg', '.mpga', '.opus', '.webm',
]
const MAX_SIZE = 50 * 1024 * 1024
const PAGE_SIZE = 5

const STATUS = {
    pending: { label: 'Waiting', icon: Clock3, style: 'bg-slate-100 text-slate-600' },
    uploading: { label: 'Uploading', icon: Loader2, style: 'bg-indigo-50 text-indigo-700', spin: true },
    processing: { label: 'Transcribing', icon: Loader2, style: 'bg-sky-50 text-sky-700', spin: true },
    done: { label: 'Done', icon: CheckCircle2, style: 'bg-emerald-50 text-emerald-700' },
    duplicate: { label: 'Already uploaded', icon: Copy, style: 'bg-amber-50 text-amber-700' },
    error: { label: 'Failed', icon: AlertCircle, style: 'bg-red-50 text-red-700' },
}

function formatSize(bytes) {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function validate(file) {
    const extension = `.${file.name.split('.').pop().toLowerCase()}`
    if (!ACCEPTED_TYPES.includes(extension)) return 'unsupported format'
    if (file.size === 0) return 'empty file'
    if (file.size > MAX_SIZE) return 'larger than 50 MB'
    return null
}

export default function UploadAudio() {
    const inputRef = useRef(null)
    const [rejected, setRejected] = useState([])
    const [page, setPage] = useState(0)
    const { items, isBusy, addFiles, removeItem, clearFinished, retry } =
        useUploadQueue(uploadAudio)

    function selectFiles(fileList) {
        const accepted = []
        const problems = []

        for (const file of Array.from(fileList ?? [])) {
            const problem = validate(file)
            if (problem) problems.push(`${file.name}: ${problem}`)
            else accepted.push(file)
        }

        setRejected(problems)
        if (accepted.length > 0) addFiles(accepted)
    }

    const finishedCount = items.filter((i) =>
        ['done', 'duplicate', 'error'].includes(i.status),
    ).length

    const totalPages = Math.max(Math.ceil(items.length / PAGE_SIZE), 1)
    const currentPage = Math.min(page, totalPages - 1)
    const visibleItems = items.slice(
        currentPage * PAGE_SIZE,
        (currentPage + 1) * PAGE_SIZE,
    )
    const activeItem = items.find(
        (item) => item.status === 'uploading' || item.status === 'processing',
    )
    const activeIsHidden = activeItem && !visibleItems.includes(activeItem)

    return (
        <section className="mx-auto max-w-3xl space-y-6">
            <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">
                    Audio workspace
                </p>
                <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                    Upload audio
                </h1>
                <p className="mt-2 leading-7 text-slate-500">
                    Select several recordings. They are transcribed one after another automatically.
                </p>
            </div>

            <div
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                    event.preventDefault()
                    selectFiles(event.dataTransfer.files)
                }}
                onClick={() => inputRef.current?.click()}
                onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        inputRef.current?.click()
                    }
                }}
                role="button"
                tabIndex={0}
                aria-label="Choose audio files"
                className="cursor-pointer rounded-2xl border-2 border-dashed border-slate-300 bg-white px-6 py-12 text-center transition hover:border-indigo-400 hover:bg-indigo-50/30"
            >
                <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                    <FileAudio size={28} />
                </div>
                <h2 className="mt-4 text-lg font-semibold text-slate-900">
                    Choose audio files
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                    Click to browse or drag and drop one or many files here.
                </p>
                <p className="mt-2 text-xs text-slate-400">
                    WAV, MP3, M4A, FLAC, OGG, AAC or WMA · Maximum 50 MB each
                </p>

                <input
                    ref={inputRef}
                    type="file"
                    multiple
                    accept={ACCEPTED_TYPES.join(',')}
                    className="hidden"
                    onChange={(event) => {
                        selectFiles(event.target.files)
                        event.target.value = ''
                    }}
                />
            </div>

            {rejected.length > 0 && (
                <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    <p className="font-semibold">Some files were skipped:</p>
                    <ul className="mt-1 list-disc pl-5">
                        {rejected.map((message) => (
                            <li key={message} className="break-all">{message}</li>
                        ))}
                    </ul>
                </div>
            )}

            {items.length > 0 && (
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-slate-600">
                            {finishedCount} / {items.length} finished
                        </p>
                        <button
                            type="button"
                            onClick={clearFinished}
                            disabled={finishedCount === 0}
                            className="text-sm font-medium text-indigo-600 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            Clear finished
                        </button>
                    </div>

                    {activeIsHidden && (
                        <div className="flex items-center gap-2 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-2.5 text-sm text-indigo-700">
                            <Loader2 size={15} className="shrink-0 animate-spin" />
                            <span className="truncate">
                                Now {activeItem.status === 'uploading' ? 'uploading' : 'transcribing'}:{' '}
                                <strong>{activeItem.file.name}</strong>
                            </span>
                        </div>
                    )}

                    <ul className="space-y-2" aria-live="polite">
                        {visibleItems.map((item) => {
                            const status = STATUS[item.status]
                            const StatusIcon = status.icon
                            const canRemove = item.status !== 'uploading' && item.status !== 'processing'

                            return (
                                <li key={item.id} className="rounded-xl border border-slate-200 bg-white p-4">
                                    <div className="flex items-center gap-3">
                                        <AudioLines size={20} className="shrink-0 text-sky-600" />

                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-semibold text-slate-900">
                                                {item.file.name}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                {formatSize(item.file.size)}
                                                {typeof item.result?.characters === 'number' &&
                                                    ` · ${item.result.characters.toLocaleString()} characters`}
                                            </p>
                                        </div>

                                        <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium ${status.style}`}>
                                            <StatusIcon size={13} className={status.spin ? 'animate-spin' : ''} />
                                            {status.label}
                                        </span>

                                        {item.status === 'error' && (
                                            <button
                                                type="button"
                                                onClick={() => retry(item.id)}
                                                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                                            >
                                                Retry
                                            </button>
                                        )}

                                        {canRemove && (
                                            <button
                                                type="button"
                                                onClick={() => removeItem(item.id)}
                                                aria-label={`Remove ${item.file.name}`}
                                                className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                                            >
                                                <X size={16} />
                                            </button>
                                        )}
                                    </div>

                                    {item.status === 'uploading' && (
                                        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
                                            <div
                                                className="h-full rounded-full bg-indigo-600 transition-all duration-300"
                                                style={{ width: `${item.progress}%` }}
                                            />
                                        </div>
                                    )}

                                    {item.status === 'processing' && (
                                        <p className="mt-2 text-xs text-slate-500">
                                            Upload complete. Transcription may take several minutes.
                                        </p>
                                    )}

                                    {item.status === 'error' && (
                                        <p className="mt-2 text-xs text-red-600">{item.error}</p>
                                    )}
                                </li>
                            )
                        })}
                    </ul>

                    <Pagination page={currentPage} totalPages={totalPages} onChange={setPage} />

                    {isBusy && (
                        <p className="text-xs text-slate-400">
                            Keep this page open until the queue finishes.
                        </p>
                    )}
                </div>
            )}
        </section>
    )
}