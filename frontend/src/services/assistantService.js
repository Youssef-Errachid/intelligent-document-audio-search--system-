import api from './api'

export async function askAssistant(question, { signal } = {}) {
    const { data } = await api.post(
        '/assistant/ask',
        { question },
        { signal, timeout: 300000 },
    )
    return data
}