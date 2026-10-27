import { motion } from 'motion/react'
import { Link } from 'react-router-dom'

import {
  MessageCircleMoreIcon,
  SearchIcon,
  FileCheck2Icon,
  AudioLinesIcon,
} from '../components/icons/DashboardIcons'
const actions = [
  {
    title: 'AI Prompting',
    description: 'Ask questions and get answers from your content.',
    icon: MessageCircleMoreIcon,
    path: '/assistant',
  },
  {
    title: 'Search by File',
    description: 'Find information inside your uploaded documents.',
    icon: SearchIcon,
    path: '/search?type=document',
  },
  {
    title: 'Extract Documents',
    description: 'Upload files and extract their text and information.',
    icon: FileCheck2Icon,
    path: '/upload/documents',
  },
  {
    title: 'Extract Audio',
    description: 'Transcribe audio files and extract useful information.',
    icon: AudioLinesIcon,
    path: '/upload/audio',
  },
]

export default function Dashboard() {
  return (
    <div className="flex min-h-[calc(100vh-5rem)] flex-col bg-white">
      {/* Page heading */}
      <section className="px-4 pt-2 text-center sm:pt-4">
        <p className="mx-auto max-w-4xl text-xl font-bold tracking-tight text-slate-900 sm:text-2xl lg:text-3xl">
          Search, extract, and explore information from your documents and audio.
        </p>
      </section>

      {/* Main action cards */}
      <section className="mt-16 flex flex-1 items-start justify-center px-4 pb-10 sm:px-6 lg:px-8">
        <div className="grid w-full max-w-[1600px] grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4 xl:gap-7">
          {actions.map((action) => {
            const Icon = action.icon

            return (
              <motion.div
                key={action.title}
                whileHover={{ y: -6 }}
                transition={{
                  type: 'spring',
                  stiffness: 300,
                  damping: 22,
                }}
                className="rounded-3xl"
              >
                <Link
                  to={action.path}
                  className="group flex min-h-[340px] flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm transition-all duration-300 hover:border-indigo-200 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-4 sm:min-h-[360px] sm:p-9"
                >
                  {/* Animated icon */}
                  <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl bg-transparent text-black transition-transform duration-300 group-hover:scale-110">
                    <Icon size={48} />
                  </div>

                  {/* Title */}
                  <h2 className="mt-7 text-xl font-bold tracking-tight text-slate-900 transition-colors  sm:text-2xl">
                    {action.title}
                  </h2>

                  {/* Description */}
                  <p className="mt-3 max-w-xs text-sm leading-7 text-slate-500 sm:text-base">
                    {action.description}
                  </p>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </section>
    </div>
  )
}