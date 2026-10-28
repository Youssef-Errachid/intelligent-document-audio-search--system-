import { useCallback, useEffect, useRef, useState } from 'react'

let nextId = 0


export default function useUploadQueue(uploadFn) {
    const [items, setItems] = useState([])
    const runningRef = useRef(false) // lock: only one file at a time

    const updateItem = useCallback((id, changes) => {
        setItems((current) =>
            current.map((item) => (item.id === id ? { ...item, ...changes } : item)),
        )
    }, [])

    const addFiles = useCallback((files) => {
        const newItems = Array.from(files).map((file) => ({
            id: ++nextId,
            file,
            status: 'pending',
            progress: 0,
            result: null,
            error: null,
        }))
        setItems((current) => [...current, ...newItems])
    }, [])

    const removeItem = useCallback((id) => {
        // a file that is being processed cannot be removed
        setItems((current) =>
            current.filter(
                (item) =>
                    item.id !== id ||
                    item.status === 'uploading' ||
                    item.status === 'processing',
            ),
        )
    }, [])

    const clearFinished = useCallback(() => {
        setItems((current) =>
            current.filter((item) =>
                ['pending', 'uploading', 'processing'].includes(item.status),
            ),
        )
    }, [])

    const retry = useCallback(
        (id) => updateItem(id, { status: 'pending', progress: 0, error: null }),
        [updateItem],
    )

    useEffect(() => {
        if (runningRef.current) return

        const next = items.find((item) => item.status === 'pending')
        if (!next) return

        runningRef.current = true
        updateItem(next.id, { status: 'uploading', progress: 0 })

        const run = async () => {
            try {
                const result = await uploadFn(next.file, {
                    onUploadProgress: (percent) =>
                        updateItem(next.id, {
                            progress: percent,
                            status: percent >= 100 ? 'processing' : 'uploading',
                        }),
                })
                runningRef.current = false
                updateItem(next.id, {
                    status: result?.duplicate ? 'duplicate' : 'done',
                    progress: 100,
                    result,
                })
            } catch (err) {
                runningRef.current = false
                updateItem(next.id, { status: 'error', error: err.message })
            }
        }
        run()
    }, [items, uploadFn, updateItem])

    const isBusy = items.some(
        (item) => item.status === 'pending' || item.status === 'uploading' || item.status === 'processing',
    )

    return { items, isBusy, addFiles, removeItem, clearFinished, retry }
}