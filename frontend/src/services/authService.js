import api from './api'
import { refreshSession, setAccessToken } from './authToken'

export async function register({ email, password, name }) {
    const { data } = await api.post('/auth/register', { email, password, name })
    setAccessToken(data.access_token)
    return data.user
}

export async function login({ email, password }) {
    const { data } = await api.post('/auth/login', { email, password })
    setAccessToken(data.access_token)
    return data.user
}

export async function logout() {
    try {
        await api.post('/auth/logout')
    } finally {
        setAccessToken(null)
    }
}

export async function restoreSession() {
    const data = await refreshSession()
    return data.user
}

export async function me() {
    const { data } = await api.get('/auth/me')
    return data
}
