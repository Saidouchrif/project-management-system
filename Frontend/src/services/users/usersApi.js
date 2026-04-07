import { apiClient } from '../http/client'
import { unwrapBackendResponse } from '../http/unwrap'

export const usersApi = {
  async createUser(payload, role) {
    const response = await apiClient.post('/api/users', {
      query: { role },
      body: payload,
    })
    return unwrapBackendResponse(response)
  },

  async updateUserRole(userId, role) {
    const response = await apiClient.put(`/api/users/${userId}/role`, {
      query: { role },
    })
    return unwrapBackendResponse(response)
  },

  async listUsers() {
    const response = await apiClient.get('/api/users')
    return unwrapBackendResponse(response)
  },

  async listDeletedUsers() {
    const response = await apiClient.get('/api/users/deleted')
    return unwrapBackendResponse(response)
  },

  async listUserOptions() {
    const response = await apiClient.get('/api/users/options')
    return unwrapBackendResponse(response)
  },

  async deleteUser(userId) {
    const response = await apiClient.delete(`/api/users/${userId}`)
    return unwrapBackendResponse(response)
  },

  async restoreUser(userId) {
    const response = await apiClient.put(`/api/users/restore/${userId}`)
    return unwrapBackendResponse(response)
  },

  async getMyProfile() {
    const response = await apiClient.get('/api/users/me')
    return unwrapBackendResponse(response)
  },

  async updateMyProfile(payload) {
    const response = await apiClient.put('/api/users/me', {
      body: payload,
    })
    return unwrapBackendResponse(response)
  },

  async changeMyPassword(payload) {
    const response = await apiClient.put('/api/users/me/password', {
      body: payload,
    })
    return unwrapBackendResponse(response)
  },
}
