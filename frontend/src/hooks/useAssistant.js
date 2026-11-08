import axios from 'axios'
import { useCallback, useEffect, useRef, useState } from 'react'
import { askAssistant } from '../services/assistantService'

export default function useAssistant() {
    const [response, setResponse] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
    const controllerRef = useRef(null)

    const ask = useCallback(async (question) => {
        controllerRef.current?.abort()
        const controller = new AbortController()
        controllerRef.current = controller

        setIsLoading(true)
        setError(null)
        setResponse(null)

        try {
            const data = await askAssistant(question, { signal: controller.signal })
            setResponse(data)
        } catch (err) {
            if (axios.isCancel(err)) return
            setError(err.message)
        } finally {
            if (controllerRef.current === controller) setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        return () => controllerRef.current?.abort()

    }, [])

    return { response, isLoading, error, ask }
}