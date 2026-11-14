import axios from 'axios'
import { apiBaseUrl } from './apiBaseUrl'

const api = axios.create({
    baseURL: apiBaseUrl,
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
