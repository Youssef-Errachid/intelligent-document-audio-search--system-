import { AudioLines, FileText, Loader2, Send } from 'lucide-react'
import { useState } from 'react'
import useAssistant from '../hooks/useAssistant'

const MIN_LENGTH = 3

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60)
  const rest = Math.floor(seconds % 60)
  return `${minutes}:${String(rest).padStart(2, '0')}`
}

function SourceCard({ source }) {
  const isAudio = source.type === 'audio'
  const Icon = isAudio ? AudioLines : FileText
  const hasTime =
      typeof source.start === 'number' && typeof source.end === 'number'

  return (
      <li className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex items-start gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-semibold text-slate-700">
                    {source.number}
                </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Icon
                  size={15}
                  aria-hidden="true"
                  className={isAudio ? 'text-sky-600' : 'text-indigo-600'}
              />
              <p dir="auto" className="truncate text-sm font-semibold text-slate-900">

                {source.source_path}
              </p>
              {hasTime && (
                  <span className="rounded-md bg-sky-50 px-2 py-0.5 text-xs font-medium text-sky-700">
                                {formatTime(source.start)} – {formatTime(source.end)}
                            </span>
              )}
            </div>
            <p dir="auto" className="mt-1.5 line-clamp-3 text-xs leading-5 text-slate-500">
              {source.excerpt}
            </p>
          </div>
        </div>
      </li>
  )
}

export default function Assistant() {
  const [value, setValue] = useState('')
  const { response, isLoading, error, ask } = useAssistant()

  const trimmed = value.trim()
  const canSubmit = trimmed.length >= MIN_LENGTH && !isLoading

  const handleSubmit = (event) => {
    event.preventDefault()
    if (canSubmit) ask(trimmed)
  }

  return (
      <section className="mx-auto max-w-4xl space-y-6">
        <div>

          <p className="eyebrow">
            Intelligence
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            AI Assistant
          </h2>
          <p className="mt-2 text-base leading-7 text-slate-500">
            Ask a question and get an answer based only on your documents and
            audio transcripts, with the sources used.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
              type="text"
              dir="auto"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              placeholder="Ask a question about your content..."
              aria-label="Question"
              maxLength={1000}
              className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
          />
          <button
              type="submit"
              disabled={!canSubmit}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-950/10 transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send size={16} aria-hidden="true" />
            Ask
          </button>
        </form>


        {isLoading && (
            <div
                role="status"
                className="flex items-center gap-3 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-indigo-700"
            >
              <Loader2 size={16} className="shrink-0 animate-spin" aria-hidden="true" />
              Searching your content and writing the answer. This can take up to a minute.
            </div>
        )}

        {error && (
            <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </div>
        )}

        {response && (
            <div className="space-y-4" aria-live="polite">
              <div className="surface rounded-2xl p-6">
                <p dir="auto" className="whitespace-pre-line text-sm leading-7 text-slate-800">
                  {response.answer}
                </p>
              </div>

              {response.sources.length > 0 && (
                  <div>
                    <h3 className="mb-2 text-sm font-semibold text-slate-700">
                      Sources

                    </h3>
                    <ul className="space-y-2">
                      {response.sources.map((source) => (
                          <SourceCard key={source.number} source={source} />
                      ))}
                    </ul>
                  </div>
              )}
            </div>
        )}
      </section>
  )
}