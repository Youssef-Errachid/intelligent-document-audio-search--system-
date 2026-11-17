import { ChevronDown } from 'lucide-react'
import { useState } from 'react'
import SourceReference from '../assistant/SourceReference'

export default function SourceList({ sources }) {
    const [isOpen, setIsOpen] = useState(true)

    return (
        <div className="mt-4">
            <button
                type="button"
                onClick={() => setIsOpen((open) => !open)}
                aria-expanded={isOpen}
                className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500 hover:text-slate-900"
            >
                Sources · {sources.length}
                <ChevronDown
                    size={14}
                    aria-hidden="true"
                    className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {isOpen && (
                <ul className="mt-2 grid gap-2 sm:grid-cols-2">
                    {sources.map((source) => (
                        <SourceReference key={source.number} source={source} />
                    ))}
                </ul>
            )}
        </div>
    )

}