import { Sparkles } from 'lucide-react'
import SourceList from './SourceList'

// turn "[1]" in the answer into a small numbered badge matching the source card
function renderWithCitations(text) {
    return text.split(/(\[\d+\])/g).map((part, index) => {
        const match = part.match(/^\[(\d+)\]$/)
        if (!match) return part
        return (
            <span
                key={index}
                className="mx-0.5 inline-flex size-4 items-center justify-center rounded-full bg-slate-900 align-text-top text-[10px] font-semibold leading-none text-white"
            >
                {match[1]}
            </span>
        )
    })
}

export default function MessageBubble({ message }) {
    if (message.role === 'user') {
        return (
            <div className="flex justify-end">
                <p
                    dir="auto"
                    className="max-w-[80%] whitespace-pre-line rounded-3xl rounded-br-lg bg-slate-900 px-4 py-3 text-sm leading-6 text-white"
                >
                    {message.text}
                </p>
            </div>
        )
    }


    const hasSources = !message.isError && message.sources?.length > 0

    return (
        <div className="flex items-start gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-white">
                <Sparkles size={15} aria-hidden="true" />
            </span>

            <div className="min-w-0 flex-1">
                <p
                    dir="auto"
                    className={`whitespace-pre-line pt-1 text-sm leading-7 ${
                        message.isError ? 'text-red-600' : 'text-slate-800'
                    }`}
                >
                    {hasSources ? renderWithCitations(message.text) : message.text}
                </p>

                {hasSources && <SourceList sources={message.sources} />}
            </div>
        </div>
    )
}