import api from './api'

export async function listAudioFiles({ skip = 0, limit = 50, signal } = {}) {
    const { data } = await api.get('/documents', {
        params: { type: 'audio', skip, limit },
        signal,
    })

    // Support different response formats without changing the backend.
    if (Array.isArray(data)) return data
    return data.items ?? data.documents ?? data.results ?? []
}


export async function uploadAudio(
    file,
    { signal, onUploadProgress } = {},
) {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('vad', String(vad))

    const { data } = await api.post('/audio/upload', formData, {
        signal,
        timeout: 600000,
        onUploadProgress: (event) => {
            if (event.total) {
                onUploadProgress?.(
                    Math.round((event.loaded / event.total) * 100),
                )
            }
        },
    })

    return data
}

