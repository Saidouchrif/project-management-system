import { apiClient } from '../http/client'
import { unwrapBackendResponse } from '../http/unwrap'

export const authApi = {
  async register(payload) {
    const response = await apiClient.post('/api/auth/register', {
      auth: false,
      body: payload,
    })
    return unwrapBackendResponse(response)
  },

  async login(payload) {
    const response = await apiClient.post('/api/auth/login', {
      auth: false,
      body: payload,
    })
    return unwrapBackendResponse(response)
  },

  async refresh(refreshToken) {
    const response = await apiClient.post('/api/auth/refresh', {
      auth: false,
      query: { refreshToken },
    })
    return unwrapBackendResponse(response)
  },

  async getAuthMe() {
    const response = await apiClient.get('/api/auth/me')
    return unwrapBackendResponse(response)
  },
}
