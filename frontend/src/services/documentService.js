import api from './api'

export async function listDocuments({
                                        type,
                                        skip = 0,
                                        limit = 20,
                                        signal,
                                    } = {}) {
    const params = { skip, limit }
    if (type) params.type = type

    const { data } = await api.get('/documents', { params, signal })
    return data
}