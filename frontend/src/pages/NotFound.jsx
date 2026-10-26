import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <section className="flex min-h-[calc(100vh-10rem)] items-center justify-center">
      <div className="w-full max-w-lg text-center">
        <p className="text-sm font-bold uppercase tracking-widest text-indigo-600">
          Error 404
        </p>
        <h2 className="mt-4 text-4xl font-bold tracking-tight text-slate-900">
          Page not found
        </h2>
        <p className="mt-4 text-slate-500">
          The page you are looking for does not exist or may have moved.
        </p>
        <Link
          to="/"
          className="mt-8 inline-flex rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
        >
          Return to dashboard
        </Link>
      </div>
    </section>
  )
}
