import api from './api'

export async function searchDocuments(
    query,
    { mode = 'keyword', limit = 10, signal } = {},
) {
    const { data } = await api.get('/search', {
        params: { q: query, mode, limit },
        signal,
    })
    return data
}