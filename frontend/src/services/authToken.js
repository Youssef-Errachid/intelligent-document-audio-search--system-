import axios from 'axios'

// The access token lives only in memory (never in localStorage).
// The refresh token is an httpOnly cookie managed by the backend.
let accessToken = null
let refreshPromise = null
const sessionExpiredListeners = new Set()

export function getAccessToken() {
    return accessToken
}

export function setAccessToken(token) {
    accessToken = token
}

export function onSessionExpired(callback) {
    sessionExpiredListeners.add(callback)
    return () => sessionExpiredListeners.delete(callback)
}

export function notifySessionExpired() {
    sessionExpiredListeners.forEach((callback) => callback())
}

// Single-flight refresh: concurrent 401s (and React StrictMode's double
// effect) share one request, so the rotating refresh cookie is used once.
export function refreshSession() {
    refreshPromise ??= axios
        .post('/api/auth/refresh', null, { timeout: 10000 })
        .then((response) => {
            setAccessToken(response.data.access_token)
            return response.data
        })
        .finally(() => {
            refreshPromise = null
        })
    return refreshPromise
}
