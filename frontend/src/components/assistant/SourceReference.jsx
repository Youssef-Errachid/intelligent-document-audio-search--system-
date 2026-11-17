import { AudioLines, FileText } from 'lucide-react'
import formatTime from '../../utils/formatTime'

export default function SourceReference({ source }) {
    const isAudio = source.type === 'audio'
    const Icon = isAudio ? AudioLines : FileText
    const hasTime =
        typeof source.start === 'number' && typeof source.end === 'number'

    return (
        <li className="rounded-2xl border border-slate-200 bg-white p-3.5">
            <div className="flex items-start gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-slate-900 text-[11px] font-semibold text-white">
                    {source.number}
                </span>

                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <Icon
                            size={14}
                            aria-hidden="true"
                            className={isAudio ? 'text-sky-600' : 'text-orange-600'}
                        />
                        <p dir="auto" className="truncate text-[13px] font-semibold text-slate-900">
                            {source.source_path}
                        </p>
                        {hasTime && (
                            <span className="rounded-full bg-sky-50 px-2 py-0.5 text-[11px] font-medium text-sky-700">
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