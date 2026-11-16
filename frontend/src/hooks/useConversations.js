import { useCallback, useEffect, useMemo, useState } from 'react'
import newId from '../utils/newId'

const STORAGE_KEY = 'documind.conversations'

function loadConversations() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        const data = raw ? JSON.parse(raw) : []
        return Array.isArray(data) ? data : []
    } catch {
        return []
    }
}

export default function useConversations() {
    const [conversations, setConversations] = useState(loadConversations)
    const [activeId, setActiveId] = useState(null) // null = a new, empty chat

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations))
        } catch {
            // storage full or blocked: the chat still works, it just is not saved
        }
    }, [conversations])

    // newest first
    const sorted = useMemo(
        () => [...conversations].sort((a, b) => b.updatedAt - a.updatedAt),
        [conversations],
    )


    const active = conversations.find((item) => item.id === activeId) ?? null

    const create = useCallback((title) => {
        const id = newId()
        const now = Date.now()
        setConversations((current) => [
            { id, title: title.trim() || 'New conversation', createdAt: now, updatedAt: now, messages: [] },
            ...current,
        ])
        setActiveId(id)
        return id
    }, [])

    const append = useCallback((id, message) => {
        setConversations((current) =>
            current.map((item) =>
                item.id === id
                    ? { ...item, messages: [...item.messages, message], updatedAt: Date.now() }
                    : item,
            ),
        )
    }, [])

    const remove = useCallback((id) => {
        setConversations((current) => current.filter((item) => item.id !== id))
        setActiveId((current) => (current === id ? null : current))
    }, [])

    return { conversations: sorted, active, activeId, create, append, remove, select: setActiveId }
}