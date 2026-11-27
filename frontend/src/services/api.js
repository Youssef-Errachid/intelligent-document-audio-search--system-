import axios from 'axios'
import {
    getAccessToken,
    notifySessionExpired,
    refreshSession,
    setAccessToken,
} from './authToken'

const api = axios.create({
    baseURL: '/api',
    timeout: 10000,
})

api.interceptors.request.use((config) => {
    const token = getAccessToken()
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (axios.isCancel(error)) {
            return Promise.reject(error)
        }

        const config = error.config
        const isAuthEndpoint = config?.url?.startsWith('/auth/')

        // Access token expired: refresh once, then retry the original request.
        if (error.response?.status === 401 && config && !config._retry && !isAuthEndpoint) {
            config._retry = true
            try {
                await refreshSession()
                return await api.request(config)
            } catch {
                setAccessToken(null)
                notifySessionExpired()
                return Promise.reject(new Error('Your session has expired. Please log in again.'))
            }
        }

        const detail = error.response?.data?.detail
        let message = 'Unable to reach the server'

        if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
            message = 'The request timed out. Try a smaller audio file or increase the timeout.'
        } else if (typeof detail === 'string') {
            message = detail
        } else if (Array.isArray(detail) && detail[0]?.msg) {
            message = detail[0].msg
        } else if (error.response) {
            message = `Request failed (${error.response.status})`
        }

        console.error('API request failed:', {
            url: error.config?.url,
            status: error.response?.status,
            code: error.code,
            message: error.message,
            detail,
        })

        return Promise.reject(new Error(message))
    },
)

export default api
