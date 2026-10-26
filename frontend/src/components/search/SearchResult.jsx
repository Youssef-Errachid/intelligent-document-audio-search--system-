import { AudioLines, FileText } from 'lucide-react'

const typeLabels = {
    pdf: 'PDF',
    docx: 'DOCX',
    csv: 'CSV',
    xml: 'XML',
    audio: 'Audio',
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60)
    const rest = Math.floor(seconds % 60)
    return `${minutes}:${String(rest).padStart(2, '0')}`
}

export default function SearchResult({ result }) {
    const isAudio = result.type === 'audio'
    const Icon = isAudio ? AudioLines : FileText
    const hasTime =
        typeof result.start === 'number' && typeof result.end === 'number'

    return (
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start gap-4">
        <span
            className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${
                isAudio ? 'bg-sky-50 text-sky-600' : 'bg-indigo-50 text-indigo-600'
            }`}
        >
          <Icon size={20} aria-hidden="true" />
        </span>

                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-sm font-semibold text-slate-900">
                            {result.source_path}
                        </h3>
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
              {typeLabels[result.type] ?? result.type}
            </span>
                        {hasTime && (
                            <span className="rounded-md bg-sky-50 px-2 py-0.5 text-xs font-medium text-sky-700">
                {formatTime(result.start)} – {formatTime(result.end)}
              </span>
                        )}
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                        {result.snippet}
                    </p>
                </div>
            </div>
        </article>
    )
}