import { ArrowUp, Paperclip } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

const MIN_LENGTH = 3 // same rule as the backend

export default function Composer({ onSend, disabled }) {
    const [value, setValue] = useState('')
    const trimmed = value.trim()
    const canSubmit = trimmed.length >= MIN_LENGTH && !disabled

    const handleSubmit = (event) => {
        event.preventDefault()
        if (!canSubmit) return
        onSend(trimmed)
        setValue('')
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 rounded-full border border-slate-200 bg-white py-2 pl-3 pr-2 shadow-sm transition focus-within:border-slate-300 focus-within:ring-4 focus-within:ring-slate-100"
        >
            <Link
                to="/upload/documents"
                title="Upload files"
                aria-label="Upload files"
                className="flex size-10 shrink-0 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
                <Paperclip size={18} aria-hidden="true" />
            </Link>


            <input
                type="text"
                dir="auto"
                value={value}
                onChange={(event) => setValue(event.target.value)}
                placeholder="Ask a question or search your content..."
                aria-label="Question"
                maxLength={1000}
                className="min-w-0 flex-1 bg-transparent px-1 text-sm text-slate-900 outline-none placeholder:text-slate-400"
            />

            <button
                type="submit"
                disabled={!canSubmit}
                aria-label="Send"
                className="flex size-11 shrink-0 items-center justify-center rounded-full bg-slate-900 text-white transition-opacity hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
                <ArrowUp size={19} aria-hidden="true" />
            </button>
        </form>
    )
}