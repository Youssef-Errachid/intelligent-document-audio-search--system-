import { FileText, Headphones } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import UploadPanel from '../components/upload/UploadPanel'

const TABS = [
    { value: 'documents', label: 'Documents', icon: FileText },
    { value: 'audio', label: 'Audio', icon: Headphones },
]

export default function UploadFiles() {
    const [params, setParams] = useSearchParams()
    const current = params.get('type') === 'audio' ? 'audio' : 'documents'

    return (
        <section className="mx-auto max-w-3xl space-y-6 py-2 sm:py-4">
            <div>
                <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                    Upload files
                </h2>
                <p className="mt-1.5 text-sm text-slate-500">
                    Select several files. They are processed one after another automatically.
                </p>
            </div>

            <div role="tablist" aria-label="File type" className="inline-flex rounded-full bg-slate-100 p-1">
                {TABS.map(({ value, label, icon: Icon }) => (
                    <button
                        key={value}
                        type="button"
                        role="tab"
                        aria-selected={current === value}
                        onClick={() => setParams({ type: value }, { replace: true })}

                        className={`inline-flex items-center gap-2 rounded-full px-5 py-1.5 text-sm font-medium transition-colors ${
                            current === value
                                ? 'bg-white text-slate-900 shadow-sm'
                                : 'text-slate-500 hover:text-slate-900'
                        }`}
                    >
                        <Icon size={15} aria-hidden="true" />
                        {label}
                    </button>
                ))}
            </div>

            {/* both panels stay mounted so a running queue survives a tab switch */}
            {TABS.map(({ value }) => (
                <div key={value} role="tabpanel" hidden={current !== value}>
                    <UploadPanel kind={value} />
                </div>
            ))}
        </section>
    )
}