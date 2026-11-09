import { AudioLines, FileText } from 'lucide-react'

const typeLabels = {
    pdf: 'PDF',
    docx: 'DOCX',
    csv: 'CSV',
    xml: 'XML',
    audio: 'Audio',
}

export default function DocumentCard({ item }) {
    const isAudio = item.type === 'audio'
    const Icon = isAudio ? AudioLines : FileText

    return (
        <article className="surface rounded-2xl p-5 transition hover:-translate-y-0.5 hover:shadow-lg">
            <div className="flex items-start gap-4">
                <span
                    className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${
                        isAudio ? 'bg-teal-50 text-teal-700' : 'bg-brand-50 text-brand-700'
                    }`}
                >
                    <Icon size={20} aria-hidden="true" />
                </span>

                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <h3 dir="auto" className="truncate text-sm font-semibold text-slate-950">
                            {item.source_path}
                        </h3>
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                            {typeLabels[item.type] ?? item.type}

                        </span>
                        {item.language && (
                            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium uppercase text-slate-600">
                                {item.language}
                            </span>
                        )}
                        {item.status && (
                            <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                                {item.status}
                            </span>
                        )}
                    </div>
                    <p dir="auto" className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
                        {item.preview}
                    </p>
                </div>
            </div>
        </article>
    )
}