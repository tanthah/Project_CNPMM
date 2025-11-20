import axios from 'axios'

const instance = axios.create({
  baseURL: 'http://localhost:4000/api', // backend server URL (change if needed)
  headers: {
    'Content-Type': 'application/json',
  },
})

// attach token from localStorage on each request
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers = config.headers || {}
    config.headers['Authorization'] = `Bearer ${token}`
  }
  return config
})

// optional: handle 401 globally
instance.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error?.response?.status === 401) {
      // optionally clear token and force reload
      localStorage.removeItem('token')
      // window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default instance
