import { useEffect, useMemo, useState } from 'react'
import { FormCard } from '../../../components/ui/FormCard'
import { StatusMessage } from '../../../components/ui/StatusMessage'
import { useAuth } from '../../../services/auth/AuthContext'
import { authApi } from '../../../services/auth/authApi'
import { usersApi } from '../../../services/users/usersApi'
import { projectsApi } from '../../../services/projects/projectsApi'
import { tasksApi } from '../../../services/tasks/tasksApi'
import { extractErrorMessage } from '../../shared/extractErrorMessage'

const ROLE_OPTIONS = ['ADMIN', 'MANAGER', 'EMPLOYE']
const TASK_STATUS_OPTIONS = ['TODO', 'IN_PROGRESS', 'DONE']

function JsonViewer({ title, data }) {
  if (!data) return null
  return (
    <div className="pm-json-viewer">
      <h4>{title}</h4>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  )
}

export function DashboardPage({ onLogout }) {
  const { user, role, refreshSession, reloadProfile } = useAuth()

  const isAdmin = role === 'ADMIN'
  const isManager = role === 'MANAGER'
  const isEmploye = role === 'EMPLOYE'

  const [sessionStatus, setSessionStatus] = useState('')
  const [sessionError, setSessionError] = useState('')
  const [sessionPayload, setSessionPayload] = useState(null)

  const [profileForm, setProfileForm] = useState({ name: '', email: '' })
  const [profileStatus, setProfileStatus] = useState('')
  const [profileError, setProfileError] = useState('')

  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '' })
  const [passwordStatus, setPasswordStatus] = useState('')
  const [passwordError, setPasswordError] = useState('')

  const [usersData, setUsersData] = useState(null)
  const [usersStatus, setUsersStatus] = useState('')
  const [usersError, setUsersError] = useState('')
  const [createUserForm, setCreateUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'EMPLOYE',
  })
  const [updateRoleForm, setUpdateRoleForm] = useState({ userId: '', role: 'EMPLOYE' })
  const [userManageId, setUserManageId] = useState('')

  const [projectsData, setProjectsData] = useState(null)
  const [projectsStatus, setProjectsStatus] = useState('')
  const [projectsError, setProjectsError] = useState('')
  const [projectForm, setProjectForm] = useState({ name: '', description: '' })
  const [projectManageId, setProjectManageId] = useState('')

  const [tasksData, setTasksData] = useState(null)
  const [tasksByUserData, setTasksByUserData] = useState(null)
  const [tasksStatus, setTasksStatus] = useState('')
  const [tasksError, setTasksError] = useState('')
  const [tasksByUserId, setTasksByUserId] = useState('')
  const [taskForm, setTaskForm] = useState({
    projectId: '',
    userId: '',
    title: '',
    description: '',
    status: 'TODO',
  })
  const [taskManageId, setTaskManageId] = useState('')
  const [taskStatusForm, setTaskStatusForm] = useState({ taskId: '', status: 'IN_PROGRESS' })

  useEffect(() => {
    setProfileForm({
      name: user?.name || '',
      email: user?.email || '',
    })
  }, [user])

  const userSummary = useMemo(
    () => ({
      id: user?.id || '-',
      name: user?.name || '-',
      email: user?.email || '-',
      role: role || '-',
    }),
    [role, user],
  )

  const resetSectionMessages = (section) => {
    if (section === 'session') {
      setSessionStatus('')
      setSessionError('')
    }
    if (section === 'profile') {
      setProfileStatus('')
      setProfileError('')
    }
    if (section === 'password') {
      setPasswordStatus('')
      setPasswordError('')
    }
    if (section === 'users') {
      setUsersStatus('')
      setUsersError('')
    }
    if (section === 'projects') {
      setProjectsStatus('')
      setProjectsError('')
    }
    if (section === 'tasks') {
      setTasksStatus('')
      setTasksError('')
    }
  }

  const handleAuthMe = async () => {
    resetSectionMessages('session')
    try {
      const response = await authApi.getAuthMe()
      setSessionPayload(response)
      setSessionStatus('Route /api/auth/me executee avec succes')
    } catch (error) {
      setSessionError(extractErrorMessage(error))
    }
  }

  const handleRefreshToken = async () => {
    resetSectionMessages('session')
    try {
      await refreshSession()
      setSessionStatus('Access token rafraichi avec succes')
    } catch (error) {
      setSessionError(extractErrorMessage(error))
    }
  }

  const handleReloadProfile = async () => {
    resetSectionMessages('session')
    try {
      const profile = await reloadProfile()
      setSessionPayload({ data: profile })
      setSessionStatus('Profil recharge')
    } catch (error) {
      setSessionError(extractErrorMessage(error))
    }
  }

  const handleUpdateProfile = async (event) => {
    event.preventDefault()
    resetSectionMessages('profile')
    try {
      const response = await usersApi.updateMyProfile(profileForm)
      setProfileStatus(response.message || 'Profil mis a jour')
      await reloadProfile()
    } catch (error) {
      setProfileError(extractErrorMessage(error))
    }
  }

  const handleChangePassword = async (event) => {
    event.preventDefault()
    resetSectionMessages('password')
    try {
      const response = await usersApi.changeMyPassword(passwordForm)
      setPasswordStatus(response.message || 'Mot de passe modifie')
      setPasswordForm({ oldPassword: '', newPassword: '' })
    } catch (error) {
      setPasswordError(extractErrorMessage(error))
    }
  }

  const handleListUsers = async () => {
    resetSectionMessages('users')
    try {
      const response = await usersApi.listUsers()
      setUsersData(response.data || [])
      setUsersStatus('Liste users chargee')
    } catch (error) {
      setUsersError(extractErrorMessage(error))
    }
  }

  const handleCreateUser = async (event) => {
    event.preventDefault()
    resetSectionMessages('users')
    try {
      const response = await usersApi.createUser(
        {
          name: createUserForm.name,
          email: createUserForm.email,
          password: createUserForm.password,
        },
        createUserForm.role,
      )
      setUsersStatus(response.message || 'User cree')
      setCreateUserForm({ name: '', email: '', password: '', role: 'EMPLOYE' })
      await handleListUsers()
    } catch (error) {
      setUsersError(extractErrorMessage(error))
    }
  }

  const handleUpdateRole = async (event) => {
    event.preventDefault()
    resetSectionMessages('users')
    try {
      const response = await usersApi.updateUserRole(updateRoleForm.userId, updateRoleForm.role)
      setUsersStatus(response.message || 'Role user mis a jour')
      await handleListUsers()
    } catch (error) {
      setUsersError(extractErrorMessage(error))
    }
  }

  const handleDeleteUser = async () => {
    resetSectionMessages('users')
    try {
      const response = await usersApi.deleteUser(userManageId)
      setUsersStatus(response.message || 'User supprime')
      await handleListUsers()
    } catch (error) {
      setUsersError(extractErrorMessage(error))
    }
  }

  const handleRestoreUser = async () => {
    resetSectionMessages('users')
    try {
      const response = await usersApi.restoreUser(userManageId)
      setUsersStatus(response.message || 'User restaure')
      await handleListUsers()
    } catch (error) {
      setUsersError(extractErrorMessage(error))
    }
  }

  const handleListProjects = async () => {
    resetSectionMessages('projects')
    try {
      const response = await projectsApi.listProjects()
      setProjectsData(response.data || [])
      setProjectsStatus('Liste projets chargee')
    } catch (error) {
      setProjectsError(extractErrorMessage(error))
    }
  }

  const handleCreateProject = async (event) => {
    event.preventDefault()
    resetSectionMessages('projects')
    try {
      const response = await projectsApi.createProject(projectForm)
      setProjectsStatus(response.message || 'Projet cree')
      setProjectForm({ name: '', description: '' })
      await handleListProjects()
    } catch (error) {
      setProjectsError(extractErrorMessage(error))
    }
  }

  const handleDeleteProject = async () => {
    resetSectionMessages('projects')
    try {
      const response = await projectsApi.deleteProject(projectManageId)
      setProjectsStatus(response.message || 'Projet supprime')
      await handleListProjects()
    } catch (error) {
      setProjectsError(extractErrorMessage(error))
    }
  }

  const handleRestoreProject = async () => {
    resetSectionMessages('projects')
    try {
      const response = await projectsApi.restoreProject(projectManageId)
      setProjectsStatus(response.message || 'Projet restaure')
      await handleListProjects()
    } catch (error) {
      setProjectsError(extractErrorMessage(error))
    }
  }

  const handleListTasks = async () => {
    resetSectionMessages('tasks')
    try {
      const response = await tasksApi.listTasks()
      setTasksData(response.data || [])
      setTasksStatus('Liste taches chargee')
    } catch (error) {
      setTasksError(extractErrorMessage(error))
    }
  }

  const handleTasksByUser = async (event) => {
    event.preventDefault()
    resetSectionMessages('tasks')
    try {
      const response = await tasksApi.getTasksByUser(tasksByUserId)
      setTasksByUserData(response.data || [])
      setTasksStatus('Taches par user chargees')
    } catch (error) {
      setTasksError(extractErrorMessage(error))
    }
  }

  const handleCreateTask = async (event) => {
    event.preventDefault()
    resetSectionMessages('tasks')
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
      setTasksStatus(response.message || 'Tache creee')
      setTaskForm({
        projectId: '',
        userId: '',
        title: '',
        description: '',
        status: 'TODO',
      })
      await handleListTasks()
    } catch (error) {
      setTasksError(extractErrorMessage(error))
    }
  }

  const handleDeleteTask = async () => {
    resetSectionMessages('tasks')
    try {
      const response = await tasksApi.deleteTask(taskManageId)
      setTasksStatus(response.message || 'Tache supprimee')
      await handleListTasks()
    } catch (error) {
      setTasksError(extractErrorMessage(error))
    }
  }

  const handleRestoreTask = async () => {
    resetSectionMessages('tasks')
    try {
      const response = await tasksApi.restoreTask(taskManageId)
      setTasksStatus(response.message || 'Tache restauree')
      await handleListTasks()
    } catch (error) {
      setTasksError(extractErrorMessage(error))
    }
  }

  const handleUpdateTaskStatus = async (event) => {
    event.preventDefault()
    resetSectionMessages('tasks')
    try {
      const response = await tasksApi.updateTaskStatus(taskStatusForm.taskId, taskStatusForm.status)
      setTasksStatus(response.message || 'Statut de tache mis a jour')
      await handleListTasks()
    } catch (error) {
      setTasksError(extractErrorMessage(error))
    }
  }

  return (
    <div className="pm-grid">
      <FormCard
        title="Session et Auth"
        subtitle="Execution des routes /api/auth/refresh et /api/auth/me"
        actions={
          <button type="button" className="pm-btn pm-btn-danger" onClick={onLogout}>
            Logout
          </button>
        }
      >
        <div className="pm-kv-grid">
          <span>ID</span>
          <strong>{userSummary.id}</strong>
          <span>Nom</span>
          <strong>{userSummary.name}</strong>
          <span>Email</span>
          <strong>{userSummary.email}</strong>
          <span>Role</span>
          <strong>{userSummary.role}</strong>
        </div>

        <div className="pm-action-row">
          <button type="button" onClick={handleAuthMe}>
            Tester /api/auth/me
          </button>
          <button type="button" onClick={handleRefreshToken}>
            Refresh token
          </button>
          <button type="button" onClick={handleReloadProfile}>
            Recharger profil
          </button>
        </div>

        <StatusMessage type="success">{sessionStatus}</StatusMessage>
        <StatusMessage type="error">{sessionError}</StatusMessage>
        <JsonViewer title="Derniere reponse auth" data={sessionPayload} />
      </FormCard>

      <FormCard title="Mon Profil" subtitle="Routes: GET /api/users/me + PUT /api/users/me">
        <form className="pm-form" onSubmit={handleUpdateProfile}>
          <label>
            Name
            <input
              type="text"
              value={profileForm.name}
              onChange={(event) =>
                setProfileForm((prev) => ({ ...prev, name: event.target.value }))
              }
            />
          </label>
          <label>
            Email
            <input
              type="email"
              value={profileForm.email}
              onChange={(event) =>
                setProfileForm((prev) => ({ ...prev, email: event.target.value }))
              }
            />
          </label>
          <button type="submit">Mettre a jour profil</button>
        </form>
        <StatusMessage type="success">{profileStatus}</StatusMessage>
        <StatusMessage type="error">{profileError}</StatusMessage>
      </FormCard>

      <FormCard
        title="Changer Mot de Passe"
        subtitle="Route: PUT /api/users/me/password (oldPassword + newPassword)"
      >
        <form className="pm-form" onSubmit={handleChangePassword}>
          <label>
            Ancien mot de passe
            <input
              type="password"
              value={passwordForm.oldPassword}
              onChange={(event) =>
                setPasswordForm((prev) => ({ ...prev, oldPassword: event.target.value }))
              }
              required
            />
          </label>
          <label>
            Nouveau mot de passe
            <input
              type="password"
              value={passwordForm.newPassword}
              onChange={(event) =>
                setPasswordForm((prev) => ({ ...prev, newPassword: event.target.value }))
              }
              required
            />
          </label>
          <button type="submit">Changer mot de passe</button>
        </form>
        <StatusMessage type="success">{passwordStatus}</StatusMessage>
        <StatusMessage type="error">{passwordError}</StatusMessage>
      </FormCard>

      {isAdmin ? (
        <FormCard title="Gestion Users (Admin)" subtitle="Toutes les routes /api/users admin">
          <div className="pm-action-row">
            <button type="button" onClick={handleListUsers}>
              Lister users
            </button>
          </div>

          <form className="pm-form" onSubmit={handleCreateUser}>
            <label>
              Name
              <input
                type="text"
                value={createUserForm.name}
                onChange={(event) =>
                  setCreateUserForm((prev) => ({ ...prev, name: event.target.value }))
                }
                required
              />
            </label>
            <label>
              Email
              <input
                type="email"
                value={createUserForm.email}
                onChange={(event) =>
                  setCreateUserForm((prev) => ({ ...prev, email: event.target.value }))
                }
                required
              />
            </label>
            <label>
              Password
              <input
                type="password"
                value={createUserForm.password}
                onChange={(event) =>
                  setCreateUserForm((prev) => ({ ...prev, password: event.target.value }))
                }
                required
              />
            </label>
            <label>
              Role
              <select
                value={createUserForm.role}
                onChange={(event) =>
                  setCreateUserForm((prev) => ({ ...prev, role: event.target.value }))
                }
              >
                {ROLE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <button type="submit">Creer user</button>
          </form>

          <form className="pm-form pm-inline-form" onSubmit={handleUpdateRole}>
            <label>
              User ID
              <input
                type="number"
                value={updateRoleForm.userId}
                onChange={(event) =>
                  setUpdateRoleForm((prev) => ({ ...prev, userId: event.target.value }))
                }
                required
              />
            </label>
            <label>
              Nouveau role
              <select
                value={updateRoleForm.role}
                onChange={(event) =>
                  setUpdateRoleForm((prev) => ({ ...prev, role: event.target.value }))
                }
              >
                {ROLE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <button type="submit">Update role</button>
          </form>

          <div className="pm-inline-form">
            <label>
              User ID action
              <input
                type="number"
                value={userManageId}
                onChange={(event) => setUserManageId(event.target.value)}
              />
            </label>
            <button type="button" onClick={handleDeleteUser}>
              Delete user
            </button>
            <button type="button" onClick={handleRestoreUser}>
              Restore user
            </button>
          </div>

          <StatusMessage type="success">{usersStatus}</StatusMessage>
          <StatusMessage type="error">{usersError}</StatusMessage>
          <JsonViewer title="Users data" data={usersData} />
        </FormCard>
      ) : null}

      {isAdmin || isManager ? (
        <FormCard
          title="Gestion Projets"
          subtitle="Routes: /api/projects (create/list/delete/restore)"
        >
          <div className="pm-action-row">
            <button type="button" onClick={handleListProjects}>
              Lister projets
            </button>
          </div>

          {isManager ? (
            <form className="pm-form" onSubmit={handleCreateProject}>
              <label>
                Nom projet
                <input
                  type="text"
                  value={projectForm.name}
                  onChange={(event) =>
                    setProjectForm((prev) => ({ ...prev, name: event.target.value }))
                  }
                  required
                />
              </label>
              <label>
                Description
                <textarea
                  value={projectForm.description}
                  onChange={(event) =>
                    setProjectForm((prev) => ({ ...prev, description: event.target.value }))
                  }
                />
              </label>
              <button type="submit">Creer projet</button>
            </form>
          ) : (
            <StatusMessage type="info">
              Note: la creation de projet est reservee aux MANAGER.
            </StatusMessage>
          )}

          <div className="pm-inline-form">
            <label>
              Project ID action
              <input
                type="number"
                value={projectManageId}
                onChange={(event) => setProjectManageId(event.target.value)}
              />
            </label>
            <button type="button" onClick={handleDeleteProject}>
              Delete project
            </button>
            <button type="button" onClick={handleRestoreProject}>
              Restore project
            </button>
          </div>

          <StatusMessage type="success">{projectsStatus}</StatusMessage>
          <StatusMessage type="error">{projectsError}</StatusMessage>
          <JsonViewer title="Projects data" data={projectsData} />
        </FormCard>
      ) : null}

      <FormCard title="Gestion Taches" subtitle="Toutes les routes /api/tasks">
        <div className="pm-action-row">
          <button type="button" onClick={handleListTasks}>
            Lister taches
          </button>
        </div>

        <form className="pm-form pm-inline-form" onSubmit={handleTasksByUser}>
          <label>
            User ID
            <input
              type="number"
              value={tasksByUserId}
              onChange={(event) => setTasksByUserId(event.target.value)}
              required
            />
          </label>
          <button type="submit">Get tasks by user</button>
        </form>

        {isManager ? (
          <form className="pm-form" onSubmit={handleCreateTask}>
            <label>
              Project ID
              <input
                type="number"
                value={taskForm.projectId}
                onChange={(event) =>
                  setTaskForm((prev) => ({ ...prev, projectId: event.target.value }))
                }
                required
              />
            </label>
            <label>
              Employe User ID
              <input
                type="number"
                value={taskForm.userId}
                onChange={(event) =>
                  setTaskForm((prev) => ({ ...prev, userId: event.target.value }))
                }
                required
              />
            </label>
            <label>
              Titre
              <input
                type="text"
                value={taskForm.title}
                onChange={(event) =>
                  setTaskForm((prev) => ({ ...prev, title: event.target.value }))
                }
                required
              />
            </label>
            <label>
              Description
              <textarea
                value={taskForm.description}
                onChange={(event) =>
                  setTaskForm((prev) => ({ ...prev, description: event.target.value }))
                }
              />
            </label>
            <label>
              Status initial
              <select
                value={taskForm.status}
                onChange={(event) =>
                  setTaskForm((prev) => ({ ...prev, status: event.target.value }))
                }
              >
                {TASK_STATUS_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <button type="submit">Creer tache</button>
          </form>
        ) : null}

        {isAdmin || isManager ? (
          <div className="pm-inline-form">
            <label>
              Task ID action
              <input
                type="number"
                value={taskManageId}
                onChange={(event) => setTaskManageId(event.target.value)}
              />
            </label>
            <button type="button" onClick={handleDeleteTask}>
              Delete task
            </button>
            <button type="button" onClick={handleRestoreTask}>
              Restore task
            </button>
          </div>
        ) : null}

        {isEmploye ? (
          <form className="pm-form pm-inline-form" onSubmit={handleUpdateTaskStatus}>
            <label>
              Task ID
              <input
                type="number"
                value={taskStatusForm.taskId}
                onChange={(event) =>
                  setTaskStatusForm((prev) => ({ ...prev, taskId: event.target.value }))
                }
                required
              />
            </label>
            <label>
              Nouveau status
              <select
                value={taskStatusForm.status}
                onChange={(event) =>
                  setTaskStatusForm((prev) => ({ ...prev, status: event.target.value }))
                }
              >
                {TASK_STATUS_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <button type="submit">Update status</button>
          </form>
        ) : null}

        <StatusMessage type="success">{tasksStatus}</StatusMessage>
        <StatusMessage type="error">{tasksError}</StatusMessage>
        <JsonViewer title="Tasks data" data={tasksData} />
        <JsonViewer title="Tasks by user data" data={tasksByUserData} />
      </FormCard>
    </div>
  )
}
