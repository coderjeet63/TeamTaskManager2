import apiClient from '../api/client'

const compactParams = (params = {}) =>
  Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== '' && value !== null && typeof value !== 'undefined',
    ),
  )

const taskService = {
  createTask: async (payload) => {
    const response = await apiClient.post('/tasks', payload)
    return response.data
  },
  deleteTask: async (taskId) => {
    const response = await apiClient.delete(`/tasks/${taskId}`)
    return response.data
  },
  getTask: async (taskId) => {
    const response = await apiClient.get(`/tasks/${taskId}`)
    return response.data
  },
  getTasks: async (params) => {
    const response = await apiClient.get('/tasks', {
      params: compactParams(params),
    })
    return response.data
  },
  updateTask: async (taskId, payload) => {
    const response = await apiClient.patch(`/tasks/${taskId}`, payload)
    return response.data
  },
  updateTaskStatus: async (taskId, status) => {
    const response = await apiClient.patch(`/tasks/${taskId}/status`, { status })
    return response.data
  },
}

export default taskService
