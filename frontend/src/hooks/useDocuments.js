import axios from 'axios'
import { useEffect, useState } from 'react'
import { listDocuments } from '../services/documentService'

export default function useDocuments({ type, page = 0, pageSize = 20 } = {}) {
    const skip = page * pageSize
    const requestKey = `${type ?? 'all'}:${skip}:${pageSize}`

    const [state, setState] = useState({ key: null, data: null, error: null })

    useEffect(() => {
        const controller = new AbortController()

        listDocuments({ type, skip, limit: pageSize, signal: controller.signal })
            .then((data) => setState({ key: requestKey, data, error: null }))
            .catch((err) => {
                if (axios.isCancel(err)) return // replaced by a newer request
                setState({ key: requestKey, data: null, error: err.message })
            })

        return () => controller.abort()
    }, [type, skip, pageSize, requestKey])

    const isLoading = state.key !== requestKey
    const isReady = !isLoading

    return {
        items: isReady && state.data ? state.data.items : [],
        total: isReady && state.data ? state.data.total : 0,
        error: isReady ? state.error : null,
        isLoading,
    }
}