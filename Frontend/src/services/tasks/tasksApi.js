import { apiClient } from '../http/client'
import { unwrapBackendResponse } from '../http/unwrap'

export const tasksApi = {
  async createTask({ projectId, userId, payload }) {
    const response = await apiClient.post('/api/tasks', {
      query: { projectId, userId },
      body: payload,
    })
    return unwrapBackendResponse(response)
  },

  async listTasks() {
    const response = await apiClient.get('/api/tasks')
    return unwrapBackendResponse(response)
  },

  async getTasksByUser(userId) {
    const response = await apiClient.get(`/api/tasks/user/${userId}`)
    return unwrapBackendResponse(response)
  },

  async deleteTask(taskId) {
    const response = await apiClient.delete(`/api/tasks/${taskId}`)
    return unwrapBackendResponse(response)
  },

  async restoreTask(taskId) {
    const response = await apiClient.put(`/api/tasks/restore/${taskId}`)
    return unwrapBackendResponse(response)
  },

  async updateTaskStatus(taskId, status) {
    const response = await apiClient.patch(`/api/tasks/${taskId}/status`, {
      query: { status },
    })
    return unwrapBackendResponse(response)
  },
}
