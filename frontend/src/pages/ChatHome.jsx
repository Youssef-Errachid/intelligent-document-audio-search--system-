import { Loader2, Plus, Search, Sparkles } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import Composer from '../components/chat/Composer'
import ConversationList from '../components/chat/ConversationList'
import EmptyState from '../components/chat/EmptyState'
import MessageBubble from '../components/chat/MessageBubble'
import useChat from '../hooks/useChat'

const USER_NAME = 'Mouad'

const SUGGESTIONS = [
    'من هو المقرئ في حصة الذكر الحكيم يوم 28 دجنبر 2021؟',
    'من هو المقرئ في حصة الذكر الحكيم يوم 22 مارس 2022؟',
    'في أي ساعة يبدأ الإرسال بالنشيد الوطني؟',
]

export default function ChatHome() {
    const {
        conversations,
        activeId,
        messages,
        isLoading,
        isActiveLoading,
        send,
        newChat,
        select,
        remove,
    } = useChat()
    const bottomRef = useRef(null)
    const isEmpty = messages.length === 0 && !isActiveLoading


    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }, [messages, isActiveLoading, activeId])

    return (
        <div className="flex h-full min-h-0 gap-4">
            <ConversationList
                conversations={conversations}
                activeId={activeId}
                onSelect={select}
                onNew={newChat}
                onRemove={remove}
            />

            <section className="flex min-h-0 min-w-0 flex-1 flex-col rounded-[28px] border border-black/5 bg-white shadow-sm">
                <header className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
                    <div className="flex min-w-0 items-center gap-3">
                        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-white">
                            <Sparkles size={20} aria-hidden="true" />
                        </span>
                        <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-900">DocuMind AI</p>
                            <p className="flex items-center gap-1.5 truncate text-xs text-slate-500">
                                <span className="size-1.5 shrink-0 rounded-full bg-emerald-500" />
                                Answers come only from your files
                            </p>
                        </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                        <Link
                            to="/search"

                            className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                            <Search size={15} aria-hidden="true" />
                            <span className="hidden sm:inline">Search</span>
                        </Link>
                        <button
                            type="button"
                            onClick={newChat}
                            disabled={activeId === null}
                            className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <Plus size={15} aria-hidden="true" />
                            <span className="hidden sm:inline">New chat</span>
                        </button>
                    </div>
                </header>

                <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-8">
                    {isEmpty ? (
                        <EmptyState name={USER_NAME} />
                    ) : (
                        <div className="mx-auto max-w-3xl space-y-6" aria-live="polite">
                            {messages.map((message) => (
                                <MessageBubble key={message.id} message={message} />
                            ))}

                            {isActiveLoading && (
                                <div role="status" className="flex items-center gap-3 text-sm text-slate-500">
                                    <Loader2 size={16} className="shrink-0 animate-spin" aria-hidden="true" />
                                    Searching your content and writing the answer. This can take up to a minute.
                                </div>
                            )}

                            <div ref={bottomRef} />
                        </div>
                    )}
                </div>

                <div className="mx-auto w-full max-w-3xl space-y-3 px-5 pb-5 sm:px-8">
                    {isEmpty && (
                        <div className="flex flex-wrap justify-center gap-2">
                            {SUGGESTIONS.map((text) => (
                                <button
                                    key={text}
                                    type="button"
                                    onClick={() => send(text)}
                                    disabled={isLoading}
                                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                                >
                                    <Sparkles size={14} className="text-orange-500" aria-hidden="true" />
                                    <span dir="auto">{text}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    <Composer onSend={send} disabled={isLoading} />
                    <p className="text-center text-xs text-slate-400">
                        Answers are based only on your files, with sources.
                    </p>
                </div>
            </section>
        </div>
    )
}