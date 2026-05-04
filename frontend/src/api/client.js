import axios from 'axios'

const rawBaseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'
// Safety check: If the URL is accidentally tripled or doubled, take only the first part
const cleanBaseURL = rawBaseURL.includes('http') ? rawBaseURL.split('http')[1] : rawBaseURL
const finalBaseURL = rawBaseURL.includes('http') ? 'http' + cleanBaseURL.split('http')[0] : rawBaseURL

const apiClient = axios.create({
  baseURL: finalBaseURL,
  withCredentials: true,
})

export default apiClient
