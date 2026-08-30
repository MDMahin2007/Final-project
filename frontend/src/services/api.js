import axios from 'axios'

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
})

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('clearpathToken')
    if (token) {
        config.headers = config.headers || {}
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('clearpathToken')
            localStorage.removeItem('clearpathUser')
            window.dispatchEvent(new Event('clearpath:unauthorized'))
        }
        return Promise.reject(error)
    }
)

export default api
