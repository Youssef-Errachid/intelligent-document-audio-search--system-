import api from './api'

export async function searchDocuments(
    query,
    { mode = 'hybrid', limit = 10, signal } = {},
) {
    const { data } = await api.get('/search', {
        params: { q: query, mode, limit },
        signal,
        timeout: 30000,
    })
    return data
}