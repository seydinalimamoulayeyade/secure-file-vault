import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL || ''

const api = axios.create({ baseURL })

// Stockage des tokens
const store = {
  get access() {
    return localStorage.getItem('sfv_access')
  },
  get refresh() {
    return localStorage.getItem('sfv_refresh')
  },
  set({ accessToken, refreshToken }) {
    if (accessToken) localStorage.setItem('sfv_access', accessToken)
    if (refreshToken) localStorage.setItem('sfv_refresh', refreshToken)
  },
  clear() {
    localStorage.removeItem('sfv_access')
    localStorage.removeItem('sfv_refresh')
  },
}

// Injecte le token d'accès sur chaque requête
api.interceptors.request.use((cfg) => {
  if (store.access) cfg.headers.Authorization = `Bearer ${store.access}`
  return cfg
})

// Tente un refresh automatique sur 401 (une seule fois par requête)
let refreshing = null
api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const original = error.config
    const status = error.response?.status
    if (status === 401 && !original._retry && store.refresh && !original.url?.includes('/auth/')) {
      original._retry = true
      try {
        refreshing =
          refreshing ||
          axios.post(`${baseURL}/api/auth/refresh`, { refreshToken: store.refresh })
        const { data } = await refreshing
        refreshing = null
        store.set({ accessToken: data.accessToken, refreshToken: data.refreshToken })
        original.headers.Authorization = `Bearer ${data.accessToken}`
        return api(original)
      } catch (e) {
        refreshing = null
        store.clear()
      }
    }
    return Promise.reject(error)
  }
)

export const tokens = store
export default api
