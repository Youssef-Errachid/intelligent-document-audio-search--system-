import { Sparkles } from 'lucide-react'

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

    return (
        <div className="flex items-start gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-white">
                <Sparkles size={15} aria-hidden="true" />
            </span>
            <p
                dir="auto"
                className={`max-w-[85%] whitespace-pre-line pt-1 text-sm leading-7 ${
                    message.isError ? 'text-red-600' : 'text-slate-800'
                }`}
            >
                {message.text}
            </p>
        </div>
    )
}