import { useEffect, useState } from 'react'
import { FormCard } from '../../../components/ui/FormCard'
import { StatusMessage } from '../../../components/ui/StatusMessage'
import { DataTable } from '../../../components/ui/DataTable'
import { usersApi } from '../../../services/users/usersApi'
import { extractErrorMessage } from '../../shared/extractErrorMessage'

const ROLE_OPTIONS = ['ADMIN', 'MANAGER', 'EMPLOYE']

export function UsersPage() {
  const [users, setUsers] = useState([])
  const [deletedUsers, setDeletedUsers] = useState([])
  const [showDeletedHistory, setShowDeletedHistory] = useState(false)
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
      setStatus('Liste utilisateurs mise a jour')
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const loadDeletedUsers = async () => {
    setStatus('')
    setError('')
    try {
      const response = await usersApi.listDeletedUsers()
      setDeletedUsers(Array.isArray(response.data) ? response.data : [])
      setStatus('Historique de suppression charge')
    } catch (err) {
      setError(extractErrorMessage(err))
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

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
      setStatus(response.message || 'Utilisateur cree')
      setCreateForm({
        name: '',
        email: '',
        password: '',
        role: 'EMPLOYE',
      })
      await loadUsers()
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
      if (showDeletedHistory) {
        await loadDeletedUsers()
      }
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
      await loadUsers()
      await loadDeletedUsers()
    } catch (err) {
      setError(extractErrorMessage(err))
    }
  }

  return (
    <>
      <FormCard title="Utilisateurs actifs" subtitle="Gestion des comptes, roles et acces">
        <div className="pm-action-row">
          <button type="button" onClick={loadUsers} disabled={loading}>
            {loading ? 'Chargement...' : 'Actualiser'}
          </button>
          <button
            type="button"
            className="pm-link-btn"
            onClick={async () => {
              const next = !showDeletedHistory
              setShowDeletedHistory(next)
              if (next) {
                await loadDeletedUsers()
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
                  <button type="button" onClick={() => handleDelete(row.id)}>
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

      {showDeletedHistory ? (
        <FormCard title="Historique suppression utilisateurs" subtitle="Selectionne et restaure le compte voulu">
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

      <FormCard title="Nouveau utilisateur" subtitle="Creation d un compte avec role choisi">
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
              onChange={(event) =>
                setCreateForm((prev) => ({ ...prev, password: event.target.value }))
              }
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
    </>
  )
}
