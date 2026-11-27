import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import newId from '../utils/newId'

const STORAGE_KEY = 'documind.conversations'

function loadConversations(key) {
    if (!key) return []
    try {
        let raw = localStorage.getItem(key)
        if (raw === null) {
            // one-time migration of pre-auth conversations to the first user
            const legacy = localStorage.getItem(STORAGE_KEY)
            if (legacy !== null) {
                localStorage.setItem(key, legacy)
                localStorage.removeItem(STORAGE_KEY)
                raw = legacy
            }
        }
        const data = raw ? JSON.parse(raw) : []
        return Array.isArray(data) ? data : []
    } catch {
        return []
    }
}

export default function useConversations() {
    const { user } = useAuth()
    const storageKey = user ? `${STORAGE_KEY}.${user.id}` : null

    // items are tagged with the key they belong to, so switching users can
    // never save one user's conversations under another user's key
    const [store, setStore] = useState(() => ({
        key: storageKey,
        items: loadConversations(storageKey),
    }))
    const [activeId, setActiveId] = useState(null) // null = a new, empty chat

    // Reset during render when the user changes (React-recommended pattern),
    // so an effect never saves one user's items under another user's key.
    const [loadedKey, setLoadedKey] = useState(storageKey)
    if (loadedKey !== storageKey) {
        setLoadedKey(storageKey)
        setStore({ key: storageKey, items: loadConversations(storageKey) })
        setActiveId(null)
    }

    useEffect(() => {
        if (!store.key) return
        try {
            localStorage.setItem(store.key, JSON.stringify(store.items))
        } catch {
            // storage full or blocked: the chat still works, it just is not saved
        }
    }, [store])

    const conversations = store.items

    // newest first
    const sorted = useMemo(
        () => [...conversations].sort((a, b) => b.updatedAt - a.updatedAt),
        [conversations],
    )

    const active = conversations.find((item) => item.id === activeId) ?? null

    const create = useCallback((title) => {
        const id = newId()
        const now = Date.now()
        setStore((current) => ({
            ...current,
            items: [
                { id, title: title.trim() || 'New conversation', createdAt: now, updatedAt: now, messages: [] },
                ...current.items,
            ],
        }))
        setActiveId(id)
        return id
    }, [])

    const append = useCallback((id, message) => {
        setStore((current) => ({
            ...current,
            items: current.items.map((item) =>
                item.id === id
                    ? { ...item, messages: [...item.messages, message], updatedAt: Date.now() }
                    : item,
            ),
        }))
    }, [])

    const remove = useCallback((id) => {
        setStore((current) => ({
            ...current,
            items: current.items.filter((item) => item.id !== id),
        }))
        setActiveId((current) => (current === id ? null : current))
    }, [])

    return { conversations: sorted, active, activeId, create, append, remove, select: setActiveId }
}
