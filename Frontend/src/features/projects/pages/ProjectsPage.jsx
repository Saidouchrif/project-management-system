import { useEffect, useMemo, useState } from 'react'
import { FormCard } from '../../../components/ui/FormCard'
import { DataTable } from '../../../components/ui/DataTable'
import { StatusMessage } from '../../../components/ui/StatusMessage'
import { projectsApi } from '../../../services/projects/projectsApi'
import { extractErrorMessage } from '../../shared/extractErrorMessage'
import { PATHS } from '../../../routes/paths'

function resolveMode(path) {
  if (path === PATHS.projectsCreate) return 'create'
  if (path === PATHS.projectsDeleted) return 'deleted'
  return 'list'
}

export function ProjectsPage({ role, path, navigate }) {
  const mode = useMemo(() => resolveMode(path), [path])
  const isManager = role === 'MANAGER'

  const [projects, setProjects] = useState([])
  const [deletedProjects, setDeletedProjects] = useState([])
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
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const loadDeletedProjects = async () => {
    setStatus('')
    setError('')
    setLoading(true)
    try {
      const response = await projectsApi.listDeletedProjects()
      setDeletedProjects(Array.isArray(response.data) ? response.data : [])
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (mode === 'deleted') {
      loadDeletedProjects()
      return
    }
    loadProjects()
  }, [mode, role])

  const handleCreateProject = async (event) => {
    event.preventDefault()
    setStatus('')
    setError('')
    try {
      const response = await projectsApi.createProject(form)
      setStatus(response.message || 'Projet cree')
      setForm({ name: '', description: '' })
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
      await loadDeletedProjects()
    } catch (err) {
      setError(extractErrorMessage(err))
    }
  }

  const topActions = (
    <div className="pm-subnav" role="tablist" aria-label="Navigation projets">
      <button
        type="button"
        className={mode === 'list' ? 'pm-chip pm-chip-active' : 'pm-chip'}
        onClick={() => navigate(PATHS.projectsList)}
      >
        Projets actifs
      </button>
      {isManager ? (
        <button
          type="button"
          className={mode === 'create' ? 'pm-chip pm-chip-active' : 'pm-chip'}
          onClick={() => navigate(PATHS.projectsCreate)}
        >
          Ajouter projet
        </button>
      ) : null}
      <button
        type="button"
        className={mode === 'deleted' ? 'pm-chip pm-chip-active' : 'pm-chip'}
        onClick={() => navigate(PATHS.projectsDeleted)}
      >
        Historique suppression
      </button>
    </div>
  )

  return (
    <>
      <FormCard
        title="Espace projets"
        subtitle={isManager ? 'Pilotage de vos projets et portefeuille manager' : 'Supervision des projets plateforme'}
        actions={topActions}
      >
        <StatusMessage type="success">{status}</StatusMessage>
        <StatusMessage type="error">{error}</StatusMessage>
      </FormCard>

      {mode === 'list' ? (
        <FormCard
          title="Projets actifs"
          subtitle="Suivi des projets en cours et operations de maintenance"
          actions={
            <button type="button" onClick={loadProjects} disabled={loading}>
              {loading ? 'Chargement...' : 'Actualiser'}
            </button>
          }
        >
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
                  <button type="button" className="pm-btn-danger" onClick={() => handleDelete(row.id)}>
                    Supprimer
                  </button>
                ),
              },
            ]}
            rows={projects}
            emptyMessage="Aucun projet actif"
          />
        </FormCard>
      ) : null}

      {mode === 'create' && isManager ? (
        <FormCard title="Ajouter un projet" subtitle="Creation d un nouveau projet avec descriptif metier">
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
                onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
              />
            </label>
            <button type="submit">Creer projet</button>
          </form>
        </FormCard>
      ) : null}

      {mode === 'deleted' ? (
        <FormCard
          title="Historique de suppression"
          subtitle="Restaurez un projet supprime depuis cette liste"
          actions={
            <button type="button" onClick={loadDeletedProjects} disabled={loading}>
              {loading ? 'Chargement...' : 'Actualiser'}
            </button>
          }
        >
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
    </>
  )
}
