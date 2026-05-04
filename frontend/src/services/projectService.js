import apiClient from '../api/client'

const compactParams = (params = {}) =>
  Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== '' && value !== null && typeof value !== 'undefined',
    ),
  )

const projectService = {
  addMember: async (projectId, payload) => {
    const response = await apiClient.post(`/projects/${projectId}/members`, payload)
    return response.data
  },
  createProject: async (payload) => {
    const response = await apiClient.post('/projects', payload)
    return response.data
  },
  deleteProject: async (projectId) => {
    const response = await apiClient.delete(`/projects/${projectId}`)
    return response.data
  },
  getProject: async (projectId) => {
    const response = await apiClient.get(`/projects/${projectId}`)
    return response.data
  },
  getProjects: async (params) => {
    const response = await apiClient.get('/projects', {
      params: compactParams(params),
    })
    return response.data
  },
  removeMember: async (projectId, userId) => {
    const response = await apiClient.delete(`/projects/${projectId}/members/${userId}`)
    return response.data
  },
  updateProject: async (projectId, payload) => {
    const response = await apiClient.patch(`/projects/${projectId}`, payload)
    return response.data
  },
}

export default projectService
