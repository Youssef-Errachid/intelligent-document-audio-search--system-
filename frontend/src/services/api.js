import axios from 'axios'

const api = axios.create({
    baseURL: '/api',
    timeout: 10000,
})

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (axios.isCancel(error)) {
            return Promise.reject(error)
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
