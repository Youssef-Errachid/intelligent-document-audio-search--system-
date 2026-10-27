import { useCallback, useEffect, useState } from 'react'
import { listAudioFiles, uploadAudio } from '../services/audioService'

export default function useAudio() {
    const [files, setFiles] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [isUploading, setIsUploading] = useState(false)
    const [error, setError] = useState(null)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [uploadPhase, setUploadPhase] = useState('idle')  

    const refresh = useCallback(async (signal) => {
        setIsLoading(true)
        setError(null)

        try {
            const data = await listAudioFiles({ signal })
            setFiles(data)
        } catch (err) {
            if (err.name !== 'CanceledError' && err.name !== 'AbortError') {
                setError(err.message || 'Unable to load audio files.')
            }
        } finally {
            if (!signal?.aborted) setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        const controller = new AbortController()
        refresh(controller.signal)

        return () => controller.abort()
    }, [refresh])

    const upload = useCallback(async (file) => {
        setIsUploading(true)
        setUploadProgress(0)
        setUploadPhase('uploading')
        setError(null)
        try {
            const result = await uploadAudio(file, {
                onUploadProgress: (percent) => {
                    setUploadProgress(percent)

                    if (percent >= 100) {
                        setUploadPhase('transcribing')
                    }
                },
            })

            setUploadPhase('done')
            await refresh()

            return result
        } catch (err) {
            setError(err.message || 'Audio upload failed.')
            throw err
        } finally {
            setIsUploading(false)
        }
    }, [refresh])

    return {
        files,
        isLoading,
        isUploading,
        uploadProgress,
        uploadPhase,
        error,
        upload,
        refresh: () => refresh(),
    }
}
