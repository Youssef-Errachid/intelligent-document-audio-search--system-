
import { useRef, useState } from 'react'
import { AudioLines, CheckCircle2, FileAudio, Upload } from 'lucide-react'
import useAudio from '../hooks/useAudio'

const ACCEPTED_TYPES = ['.wav', '.mp3', '.m4a', '.flac', '.ogg', '.aac', '.wma']
const MAX_SIZE = 50 * 1024 * 1024

function formatSize(bytes) {
    if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(1)} KB`
    }

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function UploadAudio() {
    const inputRef = useRef(null)

    const {
        upload,
        isUploading,
        uploadProgress,
        uploadPhase,
        error,
    } = useAudio()

    const [file, setFile] = useState(null)
    const [success, setSuccess] = useState(null)
    const [localError, setLocalError] = useState(null)

    function selectFile(selected) {
        setSuccess(null)
        setLocalError(null)

        if (!selected) return

        const extension = `.${selected.name.split('.').pop().toLowerCase()}`

        if (!ACCEPTED_TYPES.includes(extension)) {
            setFile(null)
            setLocalError(
                'Unsupported format. Choose WAV, MP3, M4A, FLAC, OGG, AAC or WMA.'
            )
            return
        }

        if (selected.size === 0) {
            setFile(null)
            setLocalError('The selected file is empty.')
            return
        }

        if (selected.size > MAX_SIZE) {
            setFile(null)
            setLocalError('The file exceeds the 50 MB limit.')
            return
        }

        setFile(selected)
    }

    async function handleSubmit(event) {
        event.preventDefault()

        if (!file || isUploading) return

        setSuccess(null)
        setLocalError(null)

        try {
            const uploadedFile = file
            const result = await upload(uploadedFile)

            setSuccess({
                name: result?.source_path || uploadedFile.name,
                characters: result?.characters,
                duplicate: result?.duplicate === true,
                message:
                    result?.duplicate === true
                        ? 'This audio has already been uploaded.'
                        : 'Audio uploaded and transcribed successfully.',
            })

            setFile(null)

            if (inputRef.current) {
                inputRef.current.value = ''
            }
        } catch {
            // The useAudio hook exposes the API error.
        }
    }

    const displayedError = localError || error

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
                    Upload an audio recording to extract its transcript and make it searchable.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => {
                        event.preventDefault()
                        if (!isUploading) {
                            selectFile(event.dataTransfer.files?.[0])
                        }
                    }}
                    onClick={() => {
                        if (!isUploading) inputRef.current?.click()
                    }}
                    onKeyDown={(event) => {
                        if (
                            !isUploading &&
                            (event.key === 'Enter' || event.key === ' ')
                        ) {
                            event.preventDefault()
                            inputRef.current?.click()
                        }
                    }}
                    role="button"
                    tabIndex={isUploading ? -1 : 0}
                    aria-label="Choose an audio file"
                    aria-disabled={isUploading}
                    className={`rounded-2xl border-2 border-dashed border-slate-300 bg-white px-6 py-12 text-center transition ${
                        isUploading
                            ? 'cursor-not-allowed opacity-60'
                            : 'cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30'
                    }`}
                >
                    <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                        <FileAudio size={28} />
                    </div>

                    <h2 className="mt-4 break-all text-lg font-semibold text-slate-900">
                        {file ? file.name : 'Choose an audio file'}
                    </h2>

                    <p className="mt-2 text-sm text-slate-500">
                        Click to browse or drag and drop a file here.
                    </p>

                    <p className="mt-2 text-xs text-slate-400">
                        WAV, MP3, M4A, FLAC, OGG, AAC or WMA · Maximum 50 MB
                    </p>

                    {file && (
                        <p className="mt-3 text-sm font-medium text-indigo-600">
                            {formatSize(file.size)}
                        </p>
                    )}

                    <input
                        ref={inputRef}
                        type="file"
                        accept={ACCEPTED_TYPES.join(',')}
                        className="hidden"
                        disabled={isUploading}
                        onChange={(event) => {
                            selectFile(event.target.files?.[0])
                            event.target.value = ''
                        }}
                    />
                </div>

                {displayedError && (
                    <div
                        role="alert"
                        className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                    >
                        {typeof displayedError === 'string'
                            ? displayedError
                            : 'An error occurred while processing the audio. Please try again.'}
                    </div>
                )}

                {success && (
                    <div
                        role="status"
                        className={`flex items-start gap-3 rounded-xl border p-4 text-sm ${
                            success.duplicate
                                ? 'border-amber-200 bg-amber-50 text-amber-800'
                                : 'border-emerald-200 bg-emerald-50 text-emerald-800'
                        }`}
                    >
                        <CheckCircle2
                            size={20}
                            className="mt-0.5 shrink-0"
                        />

                        <div className="min-w-0">
                            <p className="font-semibold">
                                {success.message}
                            </p>

                            <p className="mt-1 break-all">
                                {success.name}
                            </p>

                            {typeof success.characters === 'number' && (
                                <p className="mt-1">
                                    {success.characters.toLocaleString()} transcript characters
                                </p>
                            )}

                            {success.duplicate && (
                                <p className="mt-1">
                                    This file was already processed, so it was not transcribed again.
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {isUploading && (
                    <div
                        className="space-y-2 rounded-xl border border-indigo-100 bg-white p-4"
                        role="status"
                        aria-live="polite"
                    >
                        <div className="flex flex-wrap justify-between gap-2 text-sm text-slate-600">
                            <span>
                                {uploadPhase === 'transcribing'
                                    ? 'Upload complete — transcribing audio...'
                                    : 'Uploading audio...'}
                            </span>

                            <span className="font-semibold tabular-nums">
                                {uploadProgress}%
                            </span>
                        </div>

                        <div
                            className="h-2 overflow-hidden rounded-full bg-slate-100"
                            role="progressbar"
                            aria-label="Audio upload progress"
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-valuenow={uploadProgress}
                        >
                            <div
                                className="h-full rounded-full bg-indigo-600 transition-all duration-300"
                                style={{
                                    width: `${Math.min(100, Math.max(0, uploadProgress))}%`,
                                }}
                            />
                        </div>

                        {uploadPhase === 'transcribing' && (
                            <p className="text-xs text-slate-500">
                                Transcription may take several minutes for large audio files.
                            </p>
                        )}
                    </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                        <AudioLines size={18} />
                        <span>Transcription runs on the backend.</span>
                    </div>

                    <button
                        type="submit"
                        disabled={!file || isUploading}
                        className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <Upload size={18} />

                        {isUploading
                            ? uploadPhase === 'transcribing'
                                ? 'Transcribing audio...'
                                : 'Uploading audio...'
                            : 'Upload and transcribe'}
                    </button>
                </div>
            </form>
        </section>
    )
}
