import {
    AlertCircle,
    AudioLines,
    CheckCircle2,
    Clock3,
    Copy,
    FileAudio,
    FileText,
    FileUp,
    Loader2,
    X,
} from 'lucide-react'
import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Pagination from '../common/Pagination'
import useUploadQueue from '../../hooks/useUploadQueue'
import { uploadAudio } from '../../services/audioService'
import { uploadDocument } from '../../services/documentService'
import formatFileSize from '../../utils/formatFileSize'
import { validateFile } from '../../utils/fileValidation'

const PAGE_SIZE = 5

const KINDS = {
    documents: {
        accepted: ['.pdf', '.docx', '.txt', '.csv', '.xml'],
        upload: uploadDocument,
        DropIcon: FileUp,
        ItemIcon: FileText,
        itemColor: 'text-orange-600',
        ariaLabel: 'Choose documents',
        dropTitle: 'Choose documents',
        hint: 'PDF, DOCX, TXT, CSV or XML · Maximum 50 MB each',
        working: 'Extracting',
        workingNote: 'Upload complete. Extracting text (OCR can take longer for scanned PDFs).',
        duplicateLabel: 'Already exists',
        link: { to: '/documents', label: 'View documents' },
    },
    audio: {
        accepted: [
            '.wav', '.mp3', '.m4a', '.flac', '.ogg', '.aac', '.wma',
            '.mp4', '.mpeg', '.mpga', '.opus', '.webm',
        ],
        upload: uploadAudio,
        DropIcon: FileAudio,
        ItemIcon: AudioLines,
        itemColor: 'text-sky-600',
        ariaLabel: 'Choose audio files',
        dropTitle: 'Choose audio files',
        hint: 'WAV, MP3, M4A, FLAC, OGG, AAC or WMA · Maximum 50 MB each',
        working: 'Transcribing',
        workingNote: 'Upload complete. Transcription may take several minutes.',
        duplicateLabel: 'Already uploaded',
        link: { to: '/audio', label: 'View audio files' },
    },
}

export default function UploadPanel({ kind }) {
    const config = KINDS[kind]
    const isAudio = kind === 'audio'
    const { DropIcon, ItemIcon } = config

    const inputRef = useRef(null)
    const [rejected, setRejected] = useState([])
    const [page, setPage] = useState(0)
    const [vad, setVad] = useState(false)
    const [isDragging, setIsDragging] = useState(false)
    const { items, isBusy, addFiles, removeItem, clearFinished, retry } =
        useUploadQueue(config.upload)

    const statuses = {
        pending: { label: 'Waiting', icon: Clock3, style: 'bg-slate-100 text-slate-600' },
        uploading: { label: 'Uploading', icon: Loader2, style: 'bg-orange-50 text-orange-700', spin: true },
        processing: { label: config.working, icon: Loader2, style: 'bg-sky-50 text-sky-700', spin: true },
        done: { label: 'Done', icon: CheckCircle2, style: 'bg-emerald-50 text-emerald-700' },
        duplicate: { label: config.duplicateLabel, icon: Copy, style: 'bg-amber-50 text-amber-700' },
        error: { label: 'Failed', icon: AlertCircle, style: 'bg-red-50 text-red-700' },
    }

    function selectFiles(fileList) {
        const accepted = []
        const problems = []

        for (const file of Array.from(fileList ?? [])) {
            const problem = validateFile(file, config.accepted)
            if (problem) problems.push(`${file.name}: ${problem}`)
            else accepted.push(file)
        }

        setRejected(problems)
        // the queue starts by itself
        if (accepted.length > 0) addFiles(accepted, isAudio ? { vad } : {})
    }

    const finishedCount = items.filter((item) =>
        ['done', 'duplicate', 'error'].includes(item.status),
    ).length

    const totalPages = Math.max(Math.ceil(items.length / PAGE_SIZE), 1)
    const currentPage = Math.min(page, totalPages - 1) // safe if items were removed
    const visibleItems = items.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE)
    const activeItem = items.find(
        (item) => item.status === 'uploading' || item.status === 'processing',
    )
    const activeIsHidden = activeItem && !visibleItems.includes(activeItem)

    return (
        <div className="space-y-5">
            {isAudio && (
                <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4">
                    <input
                        type="checkbox"
                        checked={vad}
                        onChange={(event) => setVad(event.target.checked)}
                        className="mt-1 size-4 accent-slate-900"
                    />
                    <span>
                        <span className="block text-sm font-semibold text-slate-900">
                            Skip silence (VAD)
                        </span>
                        <span className="block text-sm text-slate-500">
                            Removes silent parts before transcribing. Faster on recordings with
                            long pauses, but very quiet speech may be missed. Applies to files
                            you add after changing it.
                        </span>
                    </span>
                </label>
            )}

            <div
                onDragOver={(event) => {
                    event.preventDefault()
                    setIsDragging(true)
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(event) => {
                    event.preventDefault()
                    setIsDragging(false)
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
                aria-label={config.ariaLabel}
                className={`cursor-pointer rounded-3xl border-2 border-dashed px-6 py-14 text-center transition ${
                    isDragging
                        ? 'border-orange-400 bg-orange-50/50'
                        : 'border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50'
                }`}
            >
                <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-orange-50 text-orange-600">
                    <DropIcon size={26} aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-lg font-semibold text-slate-900">{config.dropTitle}</h3>
                <p className="mt-2 text-sm text-slate-500">
                    Click to browse or drag and drop one or many files here.
                </p>
                <p className="mt-2 text-xs text-slate-400">{config.hint}</p>

                <input
                    ref={inputRef}
                    type="file"
                    multiple
                    accept={config.accepted.join(',')}
                    className="hidden"
                    onChange={(event) => {
                        selectFiles(event.target.files)
                        event.target.value = ''
                    }}
                />
            </div>

            {rejected.length > 0 && (
                <div
                    role="alert"
                    className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                    <p className="font-semibold">Some files were skipped:</p>
                    <ul className="mt-1 list-disc pl-5">
                        {rejected.map((message) => (
                            <li key={message} className="break-all">
                                {message}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {items.length > 0 && (
                <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 px-1">
                        <p className="text-sm font-medium text-slate-600">
                            {finishedCount} / {items.length} finished
                        </p>
                        <div className="flex items-center gap-4">
                            <Link
                                to={config.link.to}
                                className="text-sm font-medium text-slate-600 underline underline-offset-2 hover:text-slate-900"
                            >
                                {config.link.label}
                            </Link>
                            <button
                                type="button"
                                onClick={clearFinished}
                                disabled={finishedCount === 0}
                                className="text-sm font-medium text-slate-900 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                Clear finished
                            </button>
                        </div>
                    </div>

                    {activeIsHidden && (
                        <div className="flex items-center gap-2 rounded-2xl border border-orange-100 bg-orange-50 px-4 py-2.5 text-sm text-orange-700">
                            <Loader2 size={15} className="shrink-0 animate-spin" aria-hidden="true" />
                            <span className="truncate">
                                Now {activeItem.status === 'uploading' ? 'uploading' : config.working.toLowerCase()}:{' '}
                                <strong>{activeItem.file.name}</strong>
                            </span>
                        </div>
                    )}

                    <ul
                        aria-live="polite"
                        className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white"
                    >
                        {visibleItems.map((item) => {
                            const status = statuses[item.status]
                            const StatusIcon = status.icon
                            const canRemove = item.status !== 'uploading' && item.status !== 'processing'

                            return (
                                <li key={item.id} className="px-5 py-4">
                                    <div className="flex items-center gap-3">
                                        <ItemIcon size={20} className={`shrink-0 ${config.itemColor}`} aria-hidden="true" />

                                        <div className="min-w-0 flex-1">
                                            <p dir="auto" className="truncate text-sm font-semibold text-slate-900">
                                                {item.file.name}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                {formatFileSize(item.file.size)}
                                                {typeof item.result?.characters === 'number' &&
                                                    ` · ${item.result.characters.toLocaleString()} characters`}
                                            </p>
                                        </div>

                                        <span
                                            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${status.style}`}
                                        >
                                            <StatusIcon
                                                size={13}
                                                className={status.spin ? 'animate-spin' : ''}
                                                aria-hidden="true"
                                            />
                                            {status.label}
                                        </span>

                                        {item.status === 'error' && (
                                            <button
                                                type="button"
                                                onClick={() => retry(item.id)}
                                                className="text-xs font-semibold text-slate-900 hover:text-slate-600"
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
                                                <X size={16} aria-hidden="true" />
                                            </button>
                                        )}
                                    </div>

                                    {item.status === 'uploading' && (
                                        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
                                            <div
                                                className="h-full rounded-full bg-orange-500 transition-all duration-300"
                                                style={{ width: `${item.progress}%` }}
                                            />
                                        </div>
                                    )}

                                    {item.status === 'processing' && (
                                        <p className="mt-2 text-xs text-slate-500">{config.workingNote}</p>
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
                        <p className="px-1 text-xs text-slate-400">
                            Keep this page open until the queue finishes.
                        </p>
                    )}
                </div>
            )}
        </div>
    )
}