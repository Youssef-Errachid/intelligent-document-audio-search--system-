import axios from 'axios'
import { useCallback, useEffect, useRef, useState } from 'react'
import { uploadDocument } from '../services/documentService'

export default function useUploadDocument() {
    const [isUploading, setIsUploading] = useState(false)
    const [result, setResult] = useState(null)
    const [error, setError] = useState(null)
    const controllerRef = useRef(null)

    const upload = useCallback(async (file) => {
        controllerRef.current?.abort()
        const controller = new AbortController()
        controllerRef.current = controller

        setIsUploading(true)
        setResult(null)
        setError(null)

        try {
            const data = await uploadDocument(file, { signal: controller.signal })
            setResult(data)
        } catch (err) {
            if (axios.isCancel(err)) return
            setError(err.message)
        } finally {
            if (controllerRef.current === controller) setIsUploading(false)
        }
    }, [])

    const reset = useCallback(() => {
        controllerRef.current?.abort()
        setIsUploading(false)
        setResult(null)
        setError(null)
    }, [])

    useEffect(() => {
        return () => controllerRef.current?.abort()
    }, [])

    return { upload, reset, isUploading, result, error }
}