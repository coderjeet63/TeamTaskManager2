import apiClient from '../api/client'

const dashboardService = {
  getOverview: async () => {
    const response = await apiClient.get('/dashboard/overview')
    return response.data
  },
}

export default dashboardService
