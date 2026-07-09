import axios from 'axios'

// Instancia de axios que incluye el token JWT automáticamente en cada request
const api = axios.create()

api.interceptors.request.use((config) => {
  const session = localStorage.getItem('dinamik_session')
  if (session) {
    const { token } = JSON.parse(session)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

export default api