import axios from 'axios'
import { useCallback, useEffect, useRef, useState } from 'react'
import { searchDocuments } from '../services/searchService'

export default function useSearch() {
    const [results, setResults] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
    const [hasSearched, setHasSearched] = useState(false)
    const controllerRef = useRef(null)

    const search = useCallback(async (query, mode = 'keyword') => {
        // cancel the previous request if it is still running
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
            setHasSearched(true)
        } catch (err) {
            if (axios.isCancel(err)) return // replaced by a newer search, ignore
            setError(err.message)
            setResults([])
            setHasSearched(true)
        } finally {
            // only the latest request is allowed to stop the loading state
            if (controllerRef.current === controller) setIsLoading(false)
        }
    }, [])

    // cancel any pending request when the page is closed
    useEffect(() => {
        return () => controllerRef.current?.abort()
    }, [])

    return { results, isLoading, error, hasSearched, search }
}