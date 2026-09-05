import axios from 'axios'

const deployedApiUrl = 'https://final-project-e1pzkxhy3-saruf.vercel.app/api'
const apiBaseUrl = import.meta.env.VITE_API_URL ||
    (window.location.hostname === 'smartcumpas2.netlify.app' ? deployedApiUrl : '/api')

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
