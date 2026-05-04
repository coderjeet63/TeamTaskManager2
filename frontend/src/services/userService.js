import apiClient from '../api/client'

const userService = {
  searchUsers: async (query) => {
    const response = await apiClient.get('/users/search', {
      params: { query },
    })
    return response.data
  },
}

export default userService
