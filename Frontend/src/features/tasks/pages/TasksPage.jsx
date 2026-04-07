import { useEffect, useMemo, useState } from 'react'
import { FormCard } from '../../../components/ui/FormCard'
import { DataTable } from '../../../components/ui/DataTable'
import { StatusMessage } from '../../../components/ui/StatusMessage'
import { tasksApi } from '../../../services/tasks/tasksApi'
import { projectsApi } from '../../../services/projects/projectsApi'
import { usersApi } from '../../../services/users/usersApi'
import { extractErrorMessage } from '../../shared/extractErrorMessage'
import { useAuth } from '../../../services/auth/AuthContext'
import { PATHS } from '../../../routes/paths'

const TASK_STATUSES = ['TODO', 'IN_PROGRESS', 'DONE']

function resolveMode(path) {
  if (path === PATHS.tasksCreate) return 'create'
  if (path === PATHS.tasksByUser) return 'by-user'
  if (path === PATHS.tasksDeleted) return 'deleted'
  return 'board'
}

export function TasksPage({ role, path, navigate }) {
  const { user } = useAuth()
  const mode = useMemo(() => resolveMode(path), [path])

  const isManager = role === 'MANAGER'
  const isAdmin = role === 'ADMIN'
  const isEmploye = role === 'EMPLOYE'

  const [tasks, setTasks] = useState([])
  const [deletedTasks, setDeletedTasks] = useState([])
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [filterStatus, setFilterStatus] = useState('')
  const [filterText, setFilterText] = useState('')

  const [projectsOptions, setProjectsOptions] = useState([])
  const [usersOptions, setUsersOptions] = useState([])
  const [taskForm, setTaskForm] = useState({
    projectId: '',
    userId: '',
    title: '',
    description: '',
    status: 'TODO',
  })
  const [selectedUserId, setSelectedUserId] = useState('')
  const [tasksByUser, setTasksByUser] = useState([])

  const loadTasks = async () => {
    setStatus('')
    setError('')
    setLoading(true)
    try {
      const response = await tasksApi.listTasks()
      setTasks(Array.isArray(response.data) ? response.data : [])
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const loadDeletedTasks = async () => {
    setStatus('')
    setError('')
    setLoading(true)
    try {
      const response = await tasksApi.listDeletedTasks()
      setDeletedTasks(Array.isArray(response.data) ? response.data : [])
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const loadSelectOptions = async () => {
    try {
      const [usersResponse, projectsResponse] = await Promise.all([
        usersApi.listUserOptions(),
        projectsApi.listProjects().catch(() => ({ data: [] })),
      ])

      const users = Array.isArray(usersResponse?.data) ? usersResponse.data : []
      const projects = Array.isArray(projectsResponse?.data) ? projectsResponse.data : []

      setUsersOptions(users)
      setProjectsOptions(projects)

      if (!selectedUserId && users.length > 0) {
        setSelectedUserId(String(users[0].id))
      }

      if (!taskForm.userId && users.length > 0) {
        const defaultEmploye = users.find((item) => item.role === 'EMPLOYE')
        if (defaultEmploye) {
          setTaskForm((prev) => ({ ...prev, userId: String(defaultEmploye.id) }))
        }
      }

      if (!taskForm.projectId && projects.length > 0) {
        setTaskForm((prev) => ({ ...prev, projectId: String(projects[0].id) }))
      }
    } catch {
      // options are loaded in best effort mode
    }
  }

  useEffect(() => {
    if (mode === 'deleted') {
      loadDeletedTasks()
      return
    }

    if (mode === 'by-user') {
      loadSelectOptions()
      return
    }

    if (mode === 'create') {
      loadSelectOptions()
      return
    }

    loadTasks()
  }, [mode, role])

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const statusOk = !filterStatus || task.status === filterStatus
      const text = `${task.title || ''} ${task.description || ''}`.toLowerCase()
      const textOk = !filterText || text.includes(filterText.toLowerCase())
      return statusOk && textOk
    })
  }, [filterStatus, filterText, tasks])

  const handleCreateTask = async (event) => {
    event.preventDefault()
    setStatus('')
    setError('')
    try {
      const response = await tasksApi.createTask({
        projectId: taskForm.projectId,
        userId: taskForm.userId,
        payload: {
          title: taskForm.title,
          description: taskForm.description,
          status: taskForm.status,
        },
      })
      setStatus(response.message || 'Tache creee')
      setTaskForm((prev) => ({
        ...prev,
        title: '',
        description: '',
        status: 'TODO',
      }))
    } catch (err) {
      setError(extractErrorMessage(err))
    }
  }

  const handleDeleteTask = async (taskId) => {
    setStatus('')
    setError('')
    try {
      const response = await tasksApi.deleteTask(taskId)
      setStatus(response.message || 'Tache supprimee')
      await loadTasks()
    } catch (err) {
      setError(extractErrorMessage(err))
    }
  }

  const handleRestoreTask = async (taskId) => {
    setStatus('')
    setError('')
    try {
      const response = await tasksApi.restoreTask(taskId)
      setStatus(response.message || 'Tache restauree')
      await loadDeletedTasks()
    } catch (err) {
      setError(extractErrorMessage(err))
    }
  }

  const handleStatusUpdate = async (taskId, nextStatus) => {
    setStatus('')
    setError('')
    try {
      const response = await tasksApi.updateTaskStatus(taskId, nextStatus)
      setStatus(response.message || 'Statut mis a jour')
      await loadTasks()
    } catch (err) {
      setError(extractErrorMessage(err))
    }
  }

  const handleTasksByUser = async () => {
    if (!selectedUserId) return
    setStatus('')
    setError('')
    try {
      const response = await tasksApi.getTasksByUser(selectedUserId)
      setTasksByUser(Array.isArray(response.data) ? response.data : [])
    } catch (err) {
      setError(extractErrorMessage(err))
    }
  }

  const topActions = (
    <div className="pm-subnav" role="tablist" aria-label="Navigation taches">
      <button
        type="button"
        className={mode === 'board' ? 'pm-chip pm-chip-active' : 'pm-chip'}
        onClick={() => navigate(PATHS.tasksBoard)}
      >
        Board
      </button>
      {isManager ? (
        <button
          type="button"
          className={mode === 'create' ? 'pm-chip pm-chip-active' : 'pm-chip'}
          onClick={() => navigate(PATHS.tasksCreate)}
        >
          Ajouter tache
        </button>
      ) : null}
      <button
        type="button"
        className={mode === 'by-user' ? 'pm-chip pm-chip-active' : 'pm-chip'}
        onClick={() => navigate(PATHS.tasksByUser)}
      >
        Par utilisateur
      </button>
      {isAdmin || isManager ? (
        <button
          type="button"
          className={mode === 'deleted' ? 'pm-chip pm-chip-active' : 'pm-chip'}
          onClick={() => navigate(PATHS.tasksDeleted)}
        >
          Historique suppression
        </button>
      ) : null}
    </div>
  )

  return (
    <>
      <FormCard title="Espace taches" subtitle="Pilotage tickets, affectations et suivi d execution" actions={topActions}>
        <StatusMessage type="success">{status}</StatusMessage>
        <StatusMessage type="error">{error}</StatusMessage>
      </FormCard>

      {mode === 'board' ? (
        <FormCard
          title="Board des taches"
          subtitle="Filtrage rapide et suivi du statut des tickets"
          actions={
            <button type="button" onClick={loadTasks} disabled={loading}>
              {loading ? 'Chargement...' : 'Actualiser'}
            </button>
          }
        >
          <div className="pm-inline-form">
            <label>
              Statut
              <select value={filterStatus} onChange={(event) => setFilterStatus(event.target.value)}>
                <option value="">Tous</option>
                {TASK_STATUSES.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Recherche
              <input
                type="text"
                value={filterText}
                onChange={(event) => setFilterText(event.target.value)}
                placeholder="Titre ou description"
              />
            </label>
          </div>

          <DataTable
            columns={[
              { key: 'id', label: 'ID' },
              { key: 'title', label: 'Titre' },
              { key: 'status', label: 'Statut' },
              {
                key: 'assignee',
                label: 'Assigne a',
                render: (row) => row?.assignedTo?.name || row?.assignedTo?.email || '-',
              },
              {
                key: 'project',
                label: 'Projet',
                render: (row) => row?.project?.name || '-',
              },
              {
                key: 'actions',
                label: 'Actions',
                render: (row) => (
                  <div className="pm-cell-actions">
                    {(isAdmin || isManager) && (
                      <button type="button" className="pm-btn-danger" onClick={() => handleDeleteTask(row.id)}>
                        Supprimer
                      </button>
                    )}
                    {isEmploye && Number(row?.assignedTo?.id) === Number(user?.id) ? (
                      <select
                        value={row.status || 'TODO'}
                        onChange={(event) => handleStatusUpdate(row.id, event.target.value)}
                      >
                        {TASK_STATUSES.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    ) : null}
                  </div>
                ),
              },
            ]}
            rows={filteredTasks}
            emptyMessage="Aucune tache pour ce filtre"
          />
        </FormCard>
      ) : null}

      {mode === 'create' && isManager ? (
        <FormCard title="Ajouter une tache" subtitle="Selection guidee du projet et du collaborateur">
          <form className="pm-form" onSubmit={handleCreateTask}>
            <label>
              Projet
              <select
                value={taskForm.projectId}
                onChange={(event) => setTaskForm((prev) => ({ ...prev, projectId: event.target.value }))}
                required
              >
                <option value="" disabled>
                  Choisir un projet
                </option>
                {projectsOptions.map((project) => (
                  <option key={project.id} value={project.id}>
                    #{project.id} - {project.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Collaborateur
              <select
                value={taskForm.userId}
                onChange={(event) => setTaskForm((prev) => ({ ...prev, userId: event.target.value }))}
                required
              >
                <option value="" disabled>
                  Choisir un collaborateur
                </option>
                {usersOptions
                  .filter((item) => item.role === 'EMPLOYE')
                  .map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      #{employee.id} - {employee.name || employee.email}
                    </option>
                  ))}
              </select>
            </label>
            <label>
              Titre
              <input
                type="text"
                value={taskForm.title}
                onChange={(event) => setTaskForm((prev) => ({ ...prev, title: event.target.value }))}
                required
              />
            </label>
            <label>
              Description
              <textarea
                value={taskForm.description}
                onChange={(event) => setTaskForm((prev) => ({ ...prev, description: event.target.value }))}
              />
            </label>
            <label>
              Statut initial
              <select
                value={taskForm.status}
                onChange={(event) => setTaskForm((prev) => ({ ...prev, status: event.target.value }))}
              >
                {TASK_STATUSES.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <button type="submit">Creer tache</button>
          </form>
        </FormCard>
      ) : null}

      {mode === 'by-user' ? (
        <FormCard title="Taches par utilisateur" subtitle="Choisissez un utilisateur pour afficher ses tickets">
          <div className="pm-inline-form">
            <label>
              Utilisateur
              <select value={selectedUserId} onChange={(event) => setSelectedUserId(event.target.value)}>
                <option value="" disabled>
                  Choisir utilisateur
                </option>
                {usersOptions.map((item) => (
                  <option key={item.id} value={item.id}>
                    #{item.id} - {item.name || item.email} ({item.role})
                  </option>
                ))}
              </select>
            </label>
            <button type="button" onClick={handleTasksByUser}>
              Afficher
            </button>
          </div>

          <DataTable
            columns={[
              { key: 'id', label: 'ID' },
              { key: 'title', label: 'Titre' },
              { key: 'status', label: 'Statut' },
              {
                key: 'project',
                label: 'Projet',
                render: (row) => row?.project?.name || '-',
              },
            ]}
            rows={tasksByUser}
            emptyMessage="Aucune tache pour cet utilisateur"
          />
        </FormCard>
      ) : null}

      {mode === 'deleted' && (isAdmin || isManager) ? (
        <FormCard
          title="Historique de suppression"
          subtitle="Restaurez les taches supprimees selon vos droits"
          actions={
            <button type="button" onClick={loadDeletedTasks} disabled={loading}>
              {loading ? 'Chargement...' : 'Actualiser'}
            </button>
          }
        >
          <DataTable
            columns={[
              { key: 'id', label: 'ID' },
              { key: 'title', label: 'Titre' },
              { key: 'status', label: 'Statut' },
              {
                key: 'assignee',
                label: 'Assigne a',
                render: (row) => row?.assignedTo?.name || row?.assignedTo?.email || '-',
              },
              {
                key: 'project',
                label: 'Projet',
                render: (row) => row?.project?.name || '-',
              },
              {
                key: 'actions',
                label: 'Action',
                render: (row) => (
                  <button type="button" onClick={() => handleRestoreTask(row.id)}>
                    Restaurer
                  </button>
                ),
              },
            ]}
            rows={deletedTasks}
            emptyMessage="Aucune tache supprimee"
          />
        </FormCard>
      ) : null}
    </>
  )
}
