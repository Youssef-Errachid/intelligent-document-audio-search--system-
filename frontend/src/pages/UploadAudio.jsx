import { useRef, useState } from 'react'
import { AudioLines, CheckCircle2, FileAudio, Upload } from 'lucide-react'
import useAudio from '../hooks/useAudio'

const ACCEPTED_TYPES = ['.wav', '.mp3', '.m4a', '.flac', '.ogg', '.aac', '.wma']
const MAX_SIZE = 50 * 1024 * 1024

function formatSize(bytes) {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
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
            setLocalError('Unsupported format. Choose WAV, MP3, M4A, FLAC, OGG, AAC or WMA.')
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
            const result = await upload(file)
            setSuccess({
                name: result.source_path || file.name,
                characters: result.characters,
                duplicate: result.duplicate,
            })
            setFile(null)

            if (inputRef.current) inputRef.current.value = ''
        } catch {
            // The hook exposes the API error.
        }
    }

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
                        selectFile(event.dataTransfer.files?.[0])
                    }}
                    onClick={() => inputRef.current?.click()}
                    className="cursor-pointer rounded-2xl border-2 border-dashed border-slate-300 bg-white px-6 py-12 text-center transition hover:border-indigo-400 hover:bg-indigo-50/30"
                >
                    <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                        <FileAudio size={28} />
                    </div>

                    <h2 className="mt-4 text-lg font-semibold text-slate-900">
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
                        onChange={(event) => selectFile(event.target.files?.[0])}
                    />
                </div>

                {(localError || error) && (
                    <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {localError || error}
                    </div>
                )}

                {success && (
                    <div role="status" className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                        <CheckCircle2 size={20} className="mt-0.5 shrink-0" />
                        <div>
                            <p className="font-semibold">Audio processed successfully.</p>
                            <p className="mt-1">{success.name}</p>
                            {typeof success.characters === 'number' && (
                                <p className="mt-1">
                                    {success.characters.toLocaleString()} transcript characters
                                </p>
                            )}
                            {success.duplicate && (
                                <p className="mt-1">This audio file was already processed.</p>
                            )}
                        </div>
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
                        {isUploading ? 'Uploading & transcribing...' : 'Upload and transcribe'}
                       
                    </button>
                     {isUploading && (
                            <div className="space-y-2" role="status">
                                <div className="flex justify-between text-sm text-slate-600">
                                    <span>
                                        {uploadPhase === 'transcribing'
                                            ? 'Upload complete — transcribing audio...'
                                            : 'Uploading audio...'}
                                    </span>
                                    <span>{uploadProgress}%</span>
                                </div>

                                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                                    <div
                                        className="h-full rounded-full bg-indigo-600 transition-all duration-300"
                                        style={{ width: `${uploadProgress}%` }}
                                    />
                                </div>
                            </div>
                        )}
                </div>
            </form>
        </section>
    )
}
