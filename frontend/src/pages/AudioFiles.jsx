import { useState } from 'react'
import { AudioLines, Clock3, FileAudio, RefreshCw, Upload } from 'lucide-react'
import { Link } from 'react-router-dom'
import useAudio from '../hooks/useAudio'

function formatDate(value) {
    if (!value) return 'Date unavailable'

    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return 'Date unavailable'

    return date.toLocaleDateString()
}

export default function AudioFiles() {
    const { files, isLoading, error, refresh } = useAudio()
    const [query, setQuery] = useState('')

    const filteredFiles = files.filter((file) =>
        (file.source_path || file.filename || '')
            .toLowerCase()
            .includes(query.toLowerCase()),
    )

    return (
        <section className="space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">
                        Library
                    </p>
                    <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                        Audio files
                    </h1>
                    <p className="mt-2 text-slate-500">
                        Browse audio recordings and their extracted transcripts.
                    </p>
                </div>

                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={refresh}
                        disabled={isLoading}
                        aria-label="Refresh audio files"
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                    >
                        <RefreshCw size={17} />
                        Refresh
                    </button>

                    <Link
                        to="/audio/upload"
                        className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
                    >
                        <Upload size={17} />
                        Upload audio
                    </Link>
                </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <label htmlFor="audio-search" className="mb-2 block text-sm font-medium text-slate-700">
                    Filter by filename
                </label>
                <input
                    id="audio-search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search audio filenames..."
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                />
            </div>

            {error && (
                <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {error}
                </div>
            )}

            {isLoading ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500">
                    Loading audio files...
                </div>
            ) : filteredFiles.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
                    <FileAudio size={34} className="mx-auto text-slate-400" />
                    <h2 className="mt-4 font-semibold text-slate-900">
                        {query ? 'No matching files' : 'No audio files yet'}
                    </h2>
                    <p className="mt-2 text-sm text-slate-500">
                        {query
                            ? 'Try another filename.'
                            : 'Upload an audio recording to see it in your library.'}
                    </p>
                    {!query && (
                        <Link
                            to="/audio/upload"
                            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
                        >
                            <Upload size={16} />
                            Upload your first audio file
                        </Link>
                    )}
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2">
                    {filteredFiles.map((file) => (
                        <article
                            key={file.id || file._id || file.source_path}
                            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                        >
                            <div className="flex items-start gap-3">
                                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                                    <AudioLines size={22} />
                                </div>

                                <div className="min-w-0 flex-1">
                                    <h2 className="break-words font-semibold text-slate-900">
                                        {file.source_path || file.filename || 'Untitled audio'}
                                    </h2>

                                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                                        {file.status && (
                                            <span className="rounded-md bg-emerald-50 px-2 py-1 font-medium text-emerald-700">
                                                {file.status}
                                            </span>
                                        )}
                                        {file.created_at && (
                                            <span className="inline-flex items-center gap-1">
                                                <Clock3 size={13} />
                                                {formatDate(file.created_at)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {file.text && (
                                <p className="mt-4 whitespace-pre-line text-sm leading-6 text-slate-600">
                                    {file.text.length > 260
                                        ? `${file.text.slice(0, 260)}…`
                                        : file.text}
                                </p>
                            )}

                            {typeof file.characters === 'number' && (
                                <p className="mt-3 text-xs text-slate-400">
                                    {file.characters.toLocaleString()} characters
                                </p>
                            )}
                        </article>
                    ))}
                </div>
            )}
        </section>
    )
}
