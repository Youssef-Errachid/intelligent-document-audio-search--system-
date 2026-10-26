import { ArrowRight } from 'lucide-react'

export default function PagePlaceholder({ eyebrow, title, description }) {
  return (
    <section className="flex min-h-[calc(100vh-10rem)] items-center justify-center">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12">
        <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">
          {eyebrow}
        </p>
        <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
          {title}
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-base leading-7 text-slate-500">
          {description}
        </p>
        <div className="mx-auto mt-8 inline-flex items-center gap-2 rounded-lg bg-indigo-50 px-4 py-2.5 text-sm font-medium text-indigo-700">
          <span>Ready for your content</span>
          <ArrowRight size={16} aria-hidden="true" />
        </div>
      </div>
    </section>
  )
}
