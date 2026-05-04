import axios from 'axios'

const rawBaseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'
// Robust check: Split by the start of a new http/https but keep the first one
const finalBaseURL = rawBaseURL.split(/(?=https?:\/\/)/)[0]

const apiClient = axios.create({
  baseURL: finalBaseURL.trim(),
  withCredentials: true,
})

export default apiClient
