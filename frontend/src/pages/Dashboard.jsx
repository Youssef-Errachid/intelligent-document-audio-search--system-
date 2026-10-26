import {
  MessageSquareText,
  FileSearch,
  FileText,
  AudioLines,
  ArrowUpRight,
} from 'lucide-react'
import { Link } from 'react-router-dom'

const actions = [
  {
    title: 'AI Prompting',
    description: 'Ask questions and get answers from your content.',
    icon: MessageSquareText,
    path: '/assistant',
    color: 'bg-indigo-600',
    hoverColor: 'group-hover:bg-indigo-700',
  },
  {
    title: 'Search by File',
    description: 'Find information inside your uploaded documents.',
    icon: FileSearch,
    path: '/search?type=document',
    color: 'bg-blue-600',
    hoverColor: 'group-hover:bg-blue-700',
  },
  {
    title: 'Extract Documents',
    description: 'Upload files and extract their text and information.',
    icon: FileText,
    path: '/documents',
    color: 'bg-emerald-600',
    hoverColor: 'group-hover:bg-emerald-700',
  },
  {
    title: 'Extract Audio',
    description: 'Transcribe audio files and extract useful information.',
    icon: AudioLines,
    path: '/upload/audio',
    color: 'bg-rose-700',
    hoverColor: 'group-hover:bg-rose-800',
  },
]

export default function Dashboard() {
  return (
    <div className="flex min-h-[calc(100vh-5rem)] flex-col">
      {/* Page heading */}
      <section className="pt-0 text-center sm:pt-2">
        <p className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl lg:text-3xl">
          Search, extract, and explore information from your documents and audio.
        </p>
      </section>

      {/* Main action cards */}
      <section className="flex flex-1 items-start mt-20 justify-center px-4 py-0 sm:px-6 lg:px-8">
        <div className="grid w-full max-w-[1600px] grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4 xl:gap-7">
          {actions.map((action) => {
            const Icon = action.icon

            return (
              <Link
                key={action.title}
                to={action.path}
                className="group flex min-h-[340px] flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-indigo-200 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-4 sm:min-h-[360px] sm:p-9"
              >
                {/* Large icon */}
                <div
                  className={`flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl text-white shadow-md transition-transform duration-300 group-hover:scale-110 ${action.color} ${action.hoverColor}`}
                >
                  <Icon size={50} strokeWidth={1.7} aria-hidden="true" />
                </div>

                {/* Title */}
                <h2 className="mt-7 text-xl font-bold tracking-tight text-slate-900 transition-colors group-hover:text-indigo-600 sm:text-2xl">
                  {action.title}
                </h2>

                {/* Description */}
                <p className="mt-3 max-w-xs text-sm leading-7 text-slate-500 sm:text-base">
                  {action.description}
                </p>

                {/* Action link */}
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600">
                  Get started
                  <ArrowUpRight
                    size={19}
                    className="transition-transform duration-200 group-hover:translate-x-1 group-hover:-translate-y-1"
                    aria-hidden="true"
                  />
                </span>
              </Link>
            )
          })}
        </div>
      </section>
    </div>
  )
}