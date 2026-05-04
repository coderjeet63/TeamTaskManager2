import apiClient from '../api/client'

const authService = {
  getCurrentUser: async () => {
    const response = await apiClient.get('/auth/me')
    return response.data
  },
  login: async (payload) => {
    const response = await apiClient.post('/auth/login', payload)
    return response.data
  },
  logout: async () => {
    const response = await apiClient.post('/auth/logout')
    return response.data
  },
  register: async (payload) => {
    const response = await apiClient.post('/auth/register', payload)
    return response.data
  },
}

export default authService
