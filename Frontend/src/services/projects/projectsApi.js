import { apiClient } from '../http/client'
import { unwrapBackendResponse } from '../http/unwrap'

export const projectsApi = {
  async createProject(payload) {
    const response = await apiClient.post('/api/projects', {
      body: payload,
    })
    return unwrapBackendResponse(response)
  },

  async listProjects() {
    const response = await apiClient.get('/api/projects')
    return unwrapBackendResponse(response)
  },

  async deleteProject(projectId) {
    const response = await apiClient.delete(`/api/projects/${projectId}`)
    return unwrapBackendResponse(response)
  },

  async restoreProject(projectId) {
    const response = await apiClient.put(`/api/projects/restore/${projectId}`)
    return unwrapBackendResponse(response)
  },
}
