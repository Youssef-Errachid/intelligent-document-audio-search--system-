import { AudioLines, FileText } from 'lucide-react'

const typeLabels = {
    pdf: 'PDF',
    docx: 'DOCX',
    csv: 'CSV',
    xml: 'XML',
    audio: 'Audio',
}

// the backend stores the status in French
const statusStyles = {
    indexe: {
        label: 'Indexed',
        hint: 'Searchable',
        dot: 'bg-emerald-500',
        text: 'text-emerald-700',
    },
    extrait: {
        label: 'Extracted',
        hint: 'Text extracted, not searchable yet (not indexed)',
        dot: 'bg-amber-500',
        text: 'text-amber-700',
    },
}

export default function DocumentCard({ item }) {
    const isAudio = item.type === 'audio'
    const Icon = isAudio ? AudioLines : FileText
    const status = item.status
        ? statusStyles[item.status] ?? {
        label: item.status,

        hint: item.status,
        dot: 'bg-slate-400',
        text: 'text-slate-600',
    }
        : null

    return (
        <li className="flex items-start gap-4 px-5 py-4 transition-colors hover:bg-slate-50/70">
            <span
                className={`flex size-10 shrink-0 items-center justify-center rounded-full ${
                    isAudio ? 'bg-sky-50 text-sky-600' : 'bg-orange-50 text-orange-600'
                }`}
            >
                <Icon size={19} aria-hidden="true" />
            </span>

            <div className="min-w-0 flex-1">
                <h3 dir="auto" className="truncate text-sm font-semibold text-slate-900">
                    {item.source_path}
                </h3>

                {item.preview && (
                    <p dir="auto" className="mt-1 line-clamp-2 text-sm leading-6 text-slate-500">
                        {item.preview}
                    </p>
                )}

                <div className="mt-2.5 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                        {typeLabels[item.type] ?? item.type}
                    </span>
                    {item.language && (

                        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium uppercase text-slate-600">
                            {item.language}
                        </span>
                    )}
                    {status && (
                        <span
                            title={status.hint}
                            className={`inline-flex items-center gap-1.5 text-xs font-medium ${status.text}`}
                        >
                            <span className={`size-1.5 rounded-full ${status.dot}`} />
                            {status.label}
                        </span>
                    )}
                </div>
            </div>
        </li>
    )
}