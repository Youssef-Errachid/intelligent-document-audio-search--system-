import { Plus, Search, Sparkles, X } from 'lucide-react'
import { useState } from 'react'

const DAY = 24 * 60 * 60 * 1000

function startOfDay(timestamp) {
    const date = new Date(timestamp)
    date.setHours(0, 0, 0, 0)
    return date.getTime()
}

function groupLabel(timestamp) {
    const days = Math.round((startOfDay(Date.now()) - startOfDay(timestamp)) / DAY)
    if (days <= 0) return 'Today'
    if (days === 1) return 'Yesterday'
    return 'Earlier'
}

function formatWhen(timestamp) {
    if (groupLabel(timestamp) === 'Today') {
        return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    return new Date(timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })
}

function groupConversations(list) {
    const order = ['Today', 'Yesterday', 'Earlier']
    const groups = new Map(order.map((label) => [label, []]))
    for (const item of list) groups.get(groupLabel(item.updatedAt)).push(item)
    return order
        .filter((label) => groups.get(label).length > 0)
        .map((label) => ({ label, items: groups.get(label) }))

}

export default function ConversationList({ conversations, activeId, onSelect, onNew, onRemove }) {
    const [query, setQuery] = useState('')

    const needle = query.trim().toLowerCase()
    const filtered = conversations.filter((item) => item.title.toLowerCase().includes(needle))
    const groups = groupConversations(filtered)

    return (
        <aside
            aria-label="Conversations"
            className="hidden w-72 shrink-0 flex-col rounded-[28px] border border-black/5 bg-white p-4 shadow-sm lg:flex"
        >
            <div className="flex items-center justify-between px-1">
                <h2 className="text-base font-semibold text-slate-900">Conversations</h2>
                <button
                    type="button"
                    onClick={onNew}
                    className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                    <Plus size={13} aria-hidden="true" />
                    New
                </button>
            </div>

            <div className="relative mt-4">
                <Search
                    size={15}
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                    type="search"
                    dir="auto"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search conversations"
                    aria-label="Search conversations"
                    className="w-full rounded-full border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-300 focus:bg-white"
                />
            </div>

            <div className="mt-4 min-h-0 flex-1 space-y-4 overflow-y-auto">
                {groups.length === 0 && (
                    <p className="px-2 pt-4 text-center text-sm text-slate-400">
                        {conversations.length === 0 ? 'No conversations yet.' : 'No matching conversations.'}
                    </p>
                )}

                {groups.map((group) => (
                    <div key={group.label}>
                        <p className="mb-1 px-2 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                            {group.label}
                        </p>
                        <ul className="space-y-1">
                            {group.items.map((item) => {
                                const isActive = item.id === activeId
                                return (
                                    <li key={item.id} className="group relative">
                                        <button
                                            type="button"
                                            onClick={() => onSelect(item.id)}
                                            aria-current={isActive ? 'true' : undefined}

                                            className={`flex w-full items-center gap-3 rounded-2xl border px-3 py-2.5 pr-9 text-start transition ${
                                                isActive
                                                    ? 'border-slate-200 bg-white shadow-sm'
                                                    : 'border-transparent hover:bg-slate-50'
                                            }`}
                                        >
                                            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-white">
                                                <Sparkles size={13} aria-hidden="true" />
                                            </span>
                                            <span className="min-w-0 flex-1">
                                                <span dir="auto" className="block truncate text-[13px] font-medium text-slate-900">
                                                    {item.title}
                                                </span>
                                                <span className="block text-[11px] text-slate-400">
                                                    {formatWhen(item.updatedAt)}
                                                </span>
                                            </span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => onRemove(item.id)}
                                            aria-label={`Delete conversation ${item.title}`}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-400 opacity-0 hover:bg-slate-100 hover:text-red-600 focus:opacity-100 group-hover:opacity-100"
                                        >
                                            <X size={14} aria-hidden="true" />
                                        </button>
                                    </li>
                                )
                            })}
                        </ul>
                    </div>
                ))}

            </div>
        </aside>
    )
}