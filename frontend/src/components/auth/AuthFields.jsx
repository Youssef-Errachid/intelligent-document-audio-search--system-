import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'

export function AuthField({ label, type = 'text', error, ...props }) {
    const [show, setShow] = useState(false)
    const isPassword = type === 'password'
    const inputType = isPassword && show ? 'text' : type

    return (
        <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                {label}
            </span>
            <div className="relative">
                <input
                    type={inputType}
                    className={`w-full rounded-2xl border bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white dark:bg-white/5 dark:text-slate-100 dark:focus:border-slate-500 ${
                        error
                            ? 'border-red-300 dark:border-red-500/50'
                            : 'border-black/10 dark:border-white/10'
                    } ${isPassword ? 'pr-12' : ''}`}
                    {...props}
                />
                {isPassword && (
                    <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => setShow((current) => !current)}
                        aria-label={show ? 'Hide password' : 'Show password'}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    >
                        {show ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                )}
            </div>
            {error && <span className="mt-1 block text-xs text-red-500">{error}</span>}
        </label>
    )
}

export function AuthError({ message }) {
    if (!message) return null
    return (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
            {message}
        </p>
    )
}

export function AuthSubmit({ loading, children }) {
    return (
        <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-slate-900 py-3 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
        >
            {loading && (
                <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white dark:border-slate-900/30 dark:border-t-slate-900" />
            )}
            {children}
        </button>
    )
}
