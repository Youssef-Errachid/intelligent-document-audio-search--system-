import axios from 'axios'
import { useCallback, useEffect, useRef, useState } from 'react'
import { searchDocuments } from '../services/searchService'

export default function useSearch() {
    const [results, setResults] = useState([])
    const [usedMode, setUsedMode] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
    const [hasSearched, setHasSearched] = useState(false)
    const controllerRef = useRef(null)

    const search = useCallback(async (query, mode = 'hybrid') => {
        controllerRef.current?.abort()
        const controller = new AbortController()
        controllerRef.current = controller

        setIsLoading(true)
        setError(null)

        try {
            const data = await searchDocuments(query, {
                mode,
                signal: controller.signal,
            })
            setResults(data.results)
            setUsedMode(data.mode)
            setHasSearched(true)
        } catch (err) {
            if (axios.isCancel(err)) return
            setError(err.message)

            setResults([])
            setUsedMode(null)
            setHasSearched(true)
        } finally {
            // only the latest request is allowed to stop the loading state
            if (controllerRef.current === controller) setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        return () => controllerRef.current?.abort()
    }, [])

    return { results, usedMode, isLoading, error, hasSearched, search }
}