import { useEffect, useState } from 'react'
import { FormCard } from '../../../components/ui/FormCard'
import { DataTable } from '../../../components/ui/DataTable'
import { StatusMessage } from '../../../components/ui/StatusMessage'
import { projectsApi } from '../../../services/projects/projectsApi'
import { extractErrorMessage } from '../../shared/extractErrorMessage'

export function ProjectsPage({ role }) {
  const isManager = role === 'MANAGER'
  const [projects, setProjects] = useState([])
  const [deletedProjects, setDeletedProjects] = useState([])
  const [showDeletedHistory, setShowDeletedHistory] = useState(false)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '', description: '' })

  const loadProjects = async () => {
    setStatus('')
    setError('')
    setLoading(true)
    try {
      const response = await projectsApi.listProjects()
      setProjects(Array.isArray(response.data) ? response.data : [])
      setStatus('Liste projets mise a jour')
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const loadDeletedProjects = async () => {
    setStatus('')
    setError('')
    try {
      const response = await projectsApi.listDeletedProjects()
      setDeletedProjects(Array.isArray(response.data) ? response.data : [])
      setStatus('Historique de suppression charge')
    } catch (err) {
      setError(extractErrorMessage(err))
    }
  }

  useEffect(() => {
    loadProjects()
  }, [role])

  const handleCreateProject = async (event) => {
    event.preventDefault()
    setStatus('')
    setError('')
    try {
      const response = await projectsApi.createProject(form)
      setStatus(response.message || 'Projet cree')
      setForm({ name: '', description: '' })
      await loadProjects()
    } catch (err) {
      setError(extractErrorMessage(err))
    }
  }

  const handleDelete = async (projectId) => {
    setStatus('')
    setError('')
    try {
      const response = await projectsApi.deleteProject(projectId)
      setStatus(response.message || 'Projet supprime')
      await loadProjects()
      if (showDeletedHistory) {
        await loadDeletedProjects()
      }
    } catch (err) {
      setError(extractErrorMessage(err))
    }
  }

  const handleRestore = async (projectId) => {
    setStatus('')
    setError('')
    try {
      const response = await projectsApi.restoreProject(projectId)
      setStatus(response.message || 'Projet restaure')
      await loadProjects()
      await loadDeletedProjects()
    } catch (err) {
      setError(extractErrorMessage(err))
    }
  }

  return (
    <>
      <FormCard
        title="Projets en cours"
        subtitle={
          isManager
            ? 'Vous gerez vos projets avec suivi centralise'
            : 'Supervision globale des projets de la plateforme'
        }
      >
        <div className="pm-action-row">
          <button type="button" onClick={loadProjects} disabled={loading}>
            {loading ? 'Chargement...' : 'Actualiser'}
          </button>
          <button
            type="button"
            className="pm-link-btn"
            onClick={async () => {
              const next = !showDeletedHistory
              setShowDeletedHistory(next)
              if (next) {
                await loadDeletedProjects()
              }
            }}
          >
            {showDeletedHistory ? 'Masquer historique suppression' : 'Historique suppression'}
          </button>
        </div>

        <StatusMessage type="success">{status}</StatusMessage>
        <StatusMessage type="error">{error}</StatusMessage>

        <DataTable
          columns={[
            { key: 'id', label: 'ID' },
            { key: 'name', label: 'Projet' },
            { key: 'description', label: 'Description' },
            {
              key: 'manager',
              label: 'Manager',
              render: (row) => row?.manager?.name || row?.manager?.email || '-',
            },
            {
              key: 'actions',
              label: 'Action',
              render: (row) => (
                <button type="button" onClick={() => handleDelete(row.id)}>
                  Supprimer
                </button>
              ),
            },
          ]}
          rows={projects}
          emptyMessage="Aucun projet actif"
        />
      </FormCard>

      {showDeletedHistory ? (
        <FormCard title="Historique suppression projets" subtitle="Selectionne le projet a restaurer">
          <DataTable
            columns={[
              { key: 'id', label: 'ID' },
              { key: 'name', label: 'Projet' },
              { key: 'description', label: 'Description' },
              {
                key: 'manager',
                label: 'Manager',
                render: (row) => row?.manager?.name || row?.manager?.email || '-',
              },
              {
                key: 'actions',
                label: 'Action',
                render: (row) => (
                  <button type="button" onClick={() => handleRestore(row.id)}>
                    Restaurer
                  </button>
                ),
              },
            ]}
            rows={deletedProjects}
            emptyMessage="Aucun projet supprime"
          />
        </FormCard>
      ) : null}

      {isManager ? (
        <FormCard title="Nouveau projet" subtitle="Creation rapide pour demarrer vos workflows">
          <form className="pm-form" onSubmit={handleCreateProject}>
            <label>
              Nom du projet
              <input
                type="text"
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                required
              />
            </label>
            <label>
              Description
              <textarea
                value={form.description}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, description: event.target.value }))
                }
              />
            </label>
            <button type="submit">Creer projet</button>
          </form>
        </FormCard>
      ) : null}
    </>
  )
}
