import { ArrowUpRight, AudioLines, FileCheck2, FileText, MessageCircleMore, Search, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import useAudio from '../hooks/useAudio'
import useDocuments from '../hooks/useDocuments'

const actions = [
  { title: 'Search your knowledge', description: 'Find exact passages across every indexed source.', icon: Search, path: '/search', tone: 'blue' },
  { title: 'Extract documents', description: 'Turn PDF, DOCX, TXT, CSV, and XML into searchable text.', icon: FileCheck2, path: '/upload/documents', tone: 'violet' },
  { title: 'Transcribe audio', description: 'Upload recordings and create searchable transcripts.', icon: AudioLines, path: '/audio/upload', tone: 'teal' },
  { title: 'Ask the assistant', description: 'Get grounded answers with source references.', icon: MessageCircleMore, path: '/assistant', tone: 'amber' },
]

const toneClasses = {
  blue: 'bg-blue-50 text-blue-700 group-hover:bg-blue-600 group-hover:text-white',
  violet: 'bg-violet-50 text-violet-700 group-hover:bg-violet-600 group-hover:text-white',
  teal: 'bg-teal-50 text-teal-700 group-hover:bg-teal-600 group-hover:text-white',
  amber: 'bg-amber-50 text-amber-700 group-hover:bg-amber-500 group-hover:text-white',
}

export default function Dashboard() {
  const documents = useDocuments({ pageSize: 5 })
  const audio = useAudio()
  const recentItems = documents.items.slice(0, 4)

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 px-6 py-8 text-white shadow-2xl shadow-slate-950/15 sm:px-10 sm:py-10">
        <div className="absolute -right-20 -top-32 size-80 rounded-full border-[40px] border-blue-500/10" />
        <div className="absolute right-24 top-16 size-20 rounded-full bg-blue-500/20 blur-2xl" />
        <div className="relative max-w-2xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-blue-100">
            <Sparkles size={14} aria-hidden="true" />
            Your intelligence workspace
          </div>
          <h2 className="max-w-xl text-3xl font-bold tracking-tight sm:text-4xl">
            Turn scattered content into clear answers.
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
            Extract, index, and explore your documents and audio from one focused workspace.
          </p>
          <Link to="/search" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-blue-50">
            Start searching <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <Stat label="Indexed documents" value={documents.isLoading ? '—' : documents.total} icon={FileText} />
        <Stat label="Audio recordings" value={audio.isLoading ? '—' : audio.files.length} icon={AudioLines} />
        <Stat label="Search modes" value="3" detail="Keyword · semantic · hybrid" icon={Search} />
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <p className="eyebrow">Get started</p>
            <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-950">Move from content to insight</h2>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {actions.map(({ title, description, icon: Icon, path, tone }) => (
            <Link key={path} to={path} className="surface group rounded-2xl p-5 transition duration-200 hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl">
              <span className={`flex size-11 items-center justify-center rounded-xl transition-colors ${toneClasses[tone]}`}>
                <Icon size={20} aria-hidden="true" />
              </span>
              <h3 className="mt-5 text-sm font-bold text-slate-950">{title}</h3>
              <p className="mt-2 text-sm leading-5 text-slate-500">{description}</p>
              <span className="mt-5 inline-flex items-center gap-1 text-xs font-bold text-slate-400 transition group-hover:text-slate-950">Open <ArrowUpRight size={13} /></span>
            </Link>
          ))}
        </div>
      </section>

      <section className="surface rounded-2xl p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="eyebrow">Library pulse</p>
            <h2 className="mt-1 text-lg font-bold text-slate-950">Recently added</h2>
          </div>
          <Link to="/documents" className="text-sm font-bold text-brand-700 hover:text-brand-600">View library</Link>
        </div>
        {documents.error ? (
          <p className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">{documents.error}</p>
        ) : recentItems.length === 0 && !documents.isLoading ? (
          <div className="mt-6 rounded-xl border border-dashed border-slate-200 p-8 text-center">
            <FileText className="mx-auto text-slate-300" size={28} />
            <p className="mt-3 text-sm font-semibold text-slate-700">Your library is ready</p>
            <p className="mt-1 text-sm text-slate-500">Upload your first document to start building knowledge.</p>
          </div>
        ) : (
          <div className="mt-5 divide-y divide-slate-100">
            {recentItems.map((item) => (
              <div key={item.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <span className="flex size-9 items-center justify-center rounded-lg bg-brand-50 text-brand-700"><FileText size={17} /></span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-800">{item.source_path}</p>
                  <p className="mt-0.5 text-xs text-slate-400">{item.type.toUpperCase()} · {item.status || 'Indexed'}</p>
                </div>
                <span className="hidden text-xs text-slate-400 sm:block">{item.language || 'Detected'}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function Stat({ label, value, detail, icon: Icon }) {
  return (
    <div className="surface flex items-center gap-4 rounded-2xl p-5">
      <span className="flex size-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700"><Icon size={19} /></span>
      <div>
        <p className="text-2xl font-bold tracking-tight text-slate-950">{value}</p>
        <p className="text-xs font-semibold text-slate-500">{label}</p>
        {detail && <p className="mt-0.5 text-[11px] text-slate-400">{detail}</p>}
      </div>
    </div>
  )
}
