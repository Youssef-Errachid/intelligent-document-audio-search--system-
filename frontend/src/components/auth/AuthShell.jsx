import { Link } from 'react-router-dom'

export default function AuthShell({ title, subtitle, children, footer }) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#ececee] to-[#f7f7f8] p-4 dark:from-[#0a0d14] dark:to-[#0f1420]">
            <div className="w-full max-w-md">
                <div className="rounded-[28px] border border-black/5 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-[#111827]">
                    <div className="mb-8 flex flex-col items-center text-center">
                        <img
                            src="/logo.webp"
                            alt="DocuMind AI"
                            className="mb-4 size-16 object-contain"
                        />
                        <h1 className="text-2xl font-light tracking-tight text-slate-900 dark:text-slate-100">
                            {title}
                        </h1>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
                    </div>
                    {children}
                </div>
                <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
                    {footer.text}{' '}
                    <Link
                        to={footer.to}
                        className="font-medium text-slate-900 underline-offset-4 hover:underline dark:text-slate-100"
                    >
                        {footer.label}
                    </Link>
                </p>
            </div>
        </div>
    )
}
