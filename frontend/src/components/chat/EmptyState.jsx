import { Sparkles } from 'lucide-react'

function getGreeting() {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
}

export default function EmptyState({ name }) {
    return (
        <div className="flex h-full flex-col items-center justify-center px-4 text-center">
            <span className="flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-lg shadow-orange-500/30">
                <Sparkles size={28} aria-hidden="true" />
            </span>
            <h2 className="mt-5 text-xl font-semibold text-slate-900">
                {getGreeting()}, {name}
            </h2>
            <p className="mt-2 text-sm text-slate-500">
                Ask anything about your documents and audio recordings.
            </p>
        </div>
    )
}