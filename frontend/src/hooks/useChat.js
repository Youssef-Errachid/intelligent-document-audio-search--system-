import axios from 'axios'
import { useCallback, useEffect, useRef, useState } from 'react'
import { askAssistant } from '../services/assistantService'
import newId from '../utils/newId'
import useConversations from './useConversations'

const EMPTY = []

export default function useChat() {
    const { conversations, active, activeId, create, append, remove, select } =
        useConversations()
    const [loadingId, setLoadingId] = useState(null) // conversation waiting for an answer
    const controllerRef = useRef(null)

    const send = useCallback(
        async (question) => {
            // the first question of a new chat creates the conversation
            const conversationId = activeId ?? create(question.slice(0, 60))

            append(conversationId, { id: newId(), role: 'user', text: question })
            setLoadingId(conversationId)

            const controller = new AbortController()
            controllerRef.current = controller

            try {
                const data = await askAssistant(question, { signal: controller.signal })
                append(conversationId, {
                    id: newId(),
                    role: 'assistant',
                    text: data.answer,
                    sources: data.sources ?? [],

                })
            } catch (err) {
                if (axios.isCancel(err)) return
                append(conversationId, {
                    id: newId(),
                    role: 'assistant',
                    text: err.message,
                    sources: [],
                    isError: true,
                })
            } finally {
                if (controllerRef.current === controller) setLoadingId(null)
            }
        },
        [activeId, create, append],
    )

    const newChat = useCallback(() => select(null), [select])

    useEffect(() => {
        return () => controllerRef.current?.abort()
    }, [])

    return {
        conversations,
        activeId,
        messages: active?.messages ?? EMPTY,
        isLoading: loadingId !== null, // one request at a time
        isActiveLoading: loadingId !== null && loadingId === activeId,
        send,
        newChat,
        select,

        remove,
    }
}