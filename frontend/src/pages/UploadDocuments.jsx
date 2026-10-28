import {
  FileUp,
  FileText,
  FileSearch,
  Upload,
  ArrowLeft,
  ArrowRight,
  X,
  CheckCircle2,
  Loader2,
} from 'lucide-react'
import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import useUploadDocument from '../hooks/useUploadDocument'

const supportedFormats = ['PDF', 'DOCX', 'TXT', 'CSV', 'XML']

export default function UploadDocuments() {
  const inputRef = useRef(null)
  const [file, setFile] = useState(null)
  const [error, setError] = useState('')
  const { upload, reset, isUploading, result, error: uploadError } = useUploadDocument()

  const handleFile = (selectedFile) => {
    if (!selectedFile) return

    reset()
    const extension = selectedFile.name.split('.').pop().toLowerCase()

    if (!supportedFormats.map((format) => format.toLowerCase()).includes(extension)) {
      setError('Unsupported file format. Please upload PDF, DOCX, TXT, CSV, or XML.')
      setFile(null)
      return
    }

    setError('')
    setFile(selectedFile)
  }

  const formatSize = (bytes) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  const removeFile = () => {
    reset()
    setFile(null)
    setError('')
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
      <div className="min-h-screen space-y-8 bg-slate-50/50 p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <section>
          <Link
              to="/"
              className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-indigo-600"
          >
            <ArrowLeft size={17} />
            Back to Dashboard
          </Link>

          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
              <FileSearch size={30} />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Extract from Documents
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                Upload a document to extract its text and prepare its content
                for searching and analysis.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-4xl">
          <div
              role="button"
              tabIndex={0}
              onClick={() => inputRef.current?.click()}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  inputRef.current?.click()
                }
              }}
              className="cursor-pointer rounded-3xl border-2 border-dashed border-slate-300 bg-white px-5 py-12 text-center transition hover:border-emerald-400 hover:bg-emerald-50/30 sm:px-10 sm:py-16"
          >
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/20">
              <FileUp size={48} strokeWidth={1.7} />
            </div>

            <h2 className="mt-7 text-xl font-bold text-slate-900 sm:text-2xl">
              Upload your document
            </h2>

            <p className="mt-3 text-sm text-slate-500 sm:text-base">
              Drag and drop your file here, or click to browse.
            </p>

            <p className="mt-3 text-xs font-medium text-slate-400 sm:text-sm">
              Supported formats: PDF, DOCX, TXT, CSV, XML
            </p>

            <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation()
                  inputRef.current?.click()
                }}
                className="mt-7 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            >
              <Upload size={18} />
              Choose File
            </button>

            <input
                ref={inputRef}
                type="file"
                accept=".pdf,.docx,.txt,.csv,.xml"
                className="hidden"
                onChange={(event) => handleFile(event.target.files?.[0])}
            />
          </div>

          {error && (
              <p role="alert" className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">
                {error}
              </p>
          )}

          {file && (
              <div className="mt-5 flex flex-col gap-4 rounded-2xl border border-emerald-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                    <FileText size={25} />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-900">
                      {file.name}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {formatSize(file.size)} · Ready to process
                    </p>
                  </div>

                  <CheckCircle2 className="shrink-0 text-emerald-600" size={21} />
                </div>

                <button
                    type="button"
                    onClick={removeFile}
                    disabled={isUploading}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <X size={16} />
                  Remove
                </button>
              </div>
          )}
        </section>

        {uploadError && (
            <p
                role="alert"
                className="mx-auto w-full max-w-4xl rounded-xl bg-red-50 p-4 text-sm text-red-700"
            >
              {uploadError}
            </p>
        )}

        {result && (
            <div
                role="status"
                className={`mx-auto flex w-full max-w-4xl flex-col gap-3 rounded-xl p-4 text-sm sm:flex-row sm:items-center sm:justify-between ${
                    result.duplicate ? 'bg-amber-50 text-amber-800' : 'bg-emerald-50 text-emerald-800'
                }`}
            >
          <span>
            {result.duplicate
                ? 'This document already exists in your library. Nothing was added.'
                : `Text extracted successfully (${result.characters?.toLocaleString()} characters).`}
          </span>
              <Link to="/documents" className="font-semibold underline">
                View documents
              </Link>
            </div>
        )}

        {file && !result && (
            <div className="mx-auto flex w-full max-w-4xl justify-end">
              <button
                  type="button"
                  onClick={() => upload(file)}
                  disabled={isUploading}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isUploading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Extracting...
                    </>
                ) : (
                    <>
                      Extract Content
                      <ArrowRight size={18} />
                    </>
                )}
              </button>
            </div>
        )}
      </div>
  )
}