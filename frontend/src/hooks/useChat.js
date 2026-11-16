import axios from 'axios'
import { useCallback, useEffect, useRef, useState } from 'react'
import { askAssistant } from '../services/assistantService'

let nextId = 0

export default function useChat() {
    const [messages, setMessages] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const controllerRef = useRef(null)

    const send = useCallback(async (question) => {
        const controller = new AbortController()
        controllerRef.current = controller

        setMessages((current) => [
            ...current,
            { id: ++nextId, role: 'user', text: question },
        ])
        setIsLoading(true)

        try {
            const data = await askAssistant(question, { signal: controller.signal })
            setMessages((current) => [
                ...current,
                {
                    id: ++nextId,
                    role: 'assistant',
                    text: data.answer,
                    sources: data.sources ?? [],
                },
            ])

        } catch (err) {
            if (axios.isCancel(err)) return
            setMessages((current) => [
                ...current,
                { id: ++nextId, role: 'assistant', text: err.message, sources: [], isError: true },
            ])
        } finally {
            if (controllerRef.current === controller) setIsLoading(false)
        }
    }, [])

    const reset = useCallback(() => {
        controllerRef.current?.abort()
        controllerRef.current = null
        setMessages([])
        setIsLoading(false)
    }, [])

    useEffect(() => {
        return () => controllerRef.current?.abort()
    }, [])

    return { messages, isLoading, send, reset }
}