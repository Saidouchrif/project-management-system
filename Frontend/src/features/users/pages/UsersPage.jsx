import { useEffect, useMemo, useState } from 'react'
import { FormCard } from '../../../components/ui/FormCard'
import { StatusMessage } from '../../../components/ui/StatusMessage'
import { DataTable } from '../../../components/ui/DataTable'
import { usersApi } from '../../../services/users/usersApi'
import { extractErrorMessage } from '../../shared/extractErrorMessage'
import { PATHS } from '../../../routes/paths'

const ROLE_OPTIONS = ['ADMIN', 'MANAGER', 'EMPLOYE']

function resolveMode(path) {
  if (path === PATHS.usersCreate) return 'create'
  if (path === PATHS.usersDeleted) return 'deleted'
  return 'list'
}

export function UsersPage({ path, navigate }) {
  const mode = useMemo(() => resolveMode(path), [path])
  const [users, setUsers] = useState([])
  const [deletedUsers, setDeletedUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')

  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'EMPLOYE',
  })

  const loadUsers = async () => {
    setLoading(true)
    setStatus('')
    setError('')
    try {
      const response = await usersApi.listUsers()
      setUsers(Array.isArray(response.data) ? response.data : [])
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const loadDeletedUsers = async () => {
    setLoading(true)
    setStatus('')
    setError('')
    try {
      const response = await usersApi.listDeletedUsers()
      setDeletedUsers(Array.isArray(response.data) ? response.data : [])
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (mode === 'deleted') {
      loadDeletedUsers()
      return
    }
    loadUsers()
  }, [mode])

  const handleCreate = async (event) => {
    event.preventDefault()
    setStatus('')
    setError('')
    try {
      const response = await usersApi.createUser(
        {
          name: createForm.name,
          email: createForm.email,
          password: createForm.password,
        },
        createForm.role,
      )
      setStatus(response.message || 'Utilisateur cree avec succes')
      setCreateForm({ name: '', email: '', password: '', role: 'EMPLOYE' })
    } catch (err) {
      setError(extractErrorMessage(err))
    }
  }

  const handleRoleUpdate = async (userId, role) => {
    setStatus('')
    setError('')
    try {
      const response = await usersApi.updateUserRole(userId, role)
      setStatus(response.message || 'Role mis a jour')
      await loadUsers()
    } catch (err) {
      setError(extractErrorMessage(err))
    }
  }

  const handleDelete = async (userId) => {
    setStatus('')
    setError('')
    try {
      const response = await usersApi.deleteUser(userId)
      setStatus(response.message || 'Utilisateur supprime')
      await loadUsers()
    } catch (err) {
      setError(extractErrorMessage(err))
    }
  }

  const handleRestore = async (userId) => {
    setStatus('')
    setError('')
    try {
      const response = await usersApi.restoreUser(userId)
      setStatus(response.message || 'Utilisateur restaure')
      await loadDeletedUsers()
    } catch (err) {
      setError(extractErrorMessage(err))
    }
  }

  const topActions = (
    <div className="pm-subnav" role="tablist" aria-label="Navigation utilisateurs">
      <button
        type="button"
        className={mode === 'list' ? 'pm-chip pm-chip-active' : 'pm-chip'}
        onClick={() => navigate(PATHS.usersList)}
      >
        Utilisateurs actifs
      </button>
      <button
        type="button"
        className={mode === 'create' ? 'pm-chip pm-chip-active' : 'pm-chip'}
        onClick={() => navigate(PATHS.usersCreate)}
      >
        Ajouter utilisateur
      </button>
      <button
        type="button"
        className={mode === 'deleted' ? 'pm-chip pm-chip-active' : 'pm-chip'}
        onClick={() => navigate(PATHS.usersDeleted)}
      >
        Historique suppression
      </button>
    </div>
  )

  return (
    <>
      <FormCard title="Espace utilisateurs" subtitle="Administration des comptes et permissions" actions={topActions}>
        <StatusMessage type="success">{status}</StatusMessage>
        <StatusMessage type="error">{error}</StatusMessage>
      </FormCard>

      {mode === 'list' ? (
        <FormCard
          title="Utilisateurs actifs"
          subtitle="Mise a jour des roles et des droits d acces"
          actions={
            <button type="button" onClick={loadUsers} disabled={loading}>
              {loading ? 'Chargement...' : 'Actualiser'}
            </button>
          }
        >
          <DataTable
            columns={[
              { key: 'id', label: 'ID' },
              { key: 'name', label: 'Nom' },
              { key: 'email', label: 'Email' },
              { key: 'role', label: 'Role' },
              {
                key: 'actions',
                label: 'Actions',
                render: (row) => (
                  <div className="pm-cell-actions">
                    <select
                      defaultValue={row.role}
                      onChange={(event) => handleRoleUpdate(row.id, event.target.value)}
                    >
                      {ROLE_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    <button type="button" className="pm-btn-danger" onClick={() => handleDelete(row.id)}>
                      Supprimer
                    </button>
                  </div>
                ),
              },
            ]}
            rows={users}
            emptyMessage="Aucun utilisateur actif"
          />
        </FormCard>
      ) : null}

      {mode === 'create' ? (
        <FormCard title="Ajouter un utilisateur" subtitle="Creation d un compte avec role choisi par admin">
          <form className="pm-form" onSubmit={handleCreate}>
            <label>
              Nom
              <input
                type="text"
                value={createForm.name}
                onChange={(event) => setCreateForm((prev) => ({ ...prev, name: event.target.value }))}
                required
              />
            </label>
            <label>
              Email
              <input
                type="email"
                value={createForm.email}
                onChange={(event) => setCreateForm((prev) => ({ ...prev, email: event.target.value }))}
                required
              />
            </label>
            <label>
              Mot de passe
              <input
                type="password"
                value={createForm.password}
                onChange={(event) => setCreateForm((prev) => ({ ...prev, password: event.target.value }))}
                required
              />
            </label>
            <label>
              Role
              <select
                value={createForm.role}
                onChange={(event) => setCreateForm((prev) => ({ ...prev, role: event.target.value }))}
              >
                {ROLE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <button type="submit">Creer utilisateur</button>
          </form>
        </FormCard>
      ) : null}

      {mode === 'deleted' ? (
        <FormCard
          title="Historique de suppression"
          subtitle="Selectionnez un compte supprime puis restaurez en un clic"
          actions={
            <button type="button" onClick={loadDeletedUsers} disabled={loading}>
              {loading ? 'Chargement...' : 'Actualiser'}
            </button>
          }
        >
          <DataTable
            columns={[
              { key: 'id', label: 'ID' },
              { key: 'name', label: 'Nom' },
              { key: 'email', label: 'Email' },
              { key: 'role', label: 'Role' },
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
            rows={deletedUsers}
            emptyMessage="Aucun utilisateur supprime"
          />
        </FormCard>
      ) : null}
    </>
  )
}
