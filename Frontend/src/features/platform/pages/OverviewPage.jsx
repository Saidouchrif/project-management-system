import { useEffect, useState } from 'react'
import { FormCard } from '../../../components/ui/FormCard'
import { StatCard } from '../../../components/ui/StatCard'
import { usersApi } from '../../../services/users/usersApi'
import { projectsApi } from '../../../services/projects/projectsApi'
import { tasksApi } from '../../../services/tasks/tasksApi'
import { extractErrorMessage } from '../../shared/extractErrorMessage'
import { StatusMessage } from '../../../components/ui/StatusMessage'

export function OverviewPage({ role }) {
  const [stats, setStats] = useState({
    users: '-',
    projects: '-',
    tasks: '-',
  })
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let isCancelled = false

    async function loadStats() {
      setLoading(true)
      setStatus('')
      setError('')
      try {
        const tasksResponse = await tasksApi.listTasks()
        const next = {
          users: '-',
          projects: '-',
          tasks: Array.isArray(tasksResponse?.data) ? tasksResponse.data.length : 0,
        }

        if (role === 'ADMIN' || role === 'MANAGER') {
          const projectsResponse = await projectsApi.listProjects()
          next.projects = Array.isArray(projectsResponse?.data) ? projectsResponse.data.length : 0
        }

        if (role === 'ADMIN') {
          const usersResponse = await usersApi.listUsers()
          next.users = Array.isArray(usersResponse?.data) ? usersResponse.data.length : 0
        }

        if (!isCancelled) {
          setStats(next)
          setStatus('Statistiques chargees')
        }
      } catch (err) {
        if (!isCancelled) {
          setError(extractErrorMessage(err))
        }
      } finally {
        if (!isCancelled) {
          setLoading(false)
        }
      }
    }

    loadStats()
    return () => {
      isCancelled = true
    }
  }, [role])

  return (
    <>
      <FormCard title="Vue Generale" subtitle="Synthese operationnelle de votre espace">
        <div className="pm-stats-grid">
          <StatCard
            label="Utilisateurs actifs"
            value={stats.users}
            hint={role === 'ADMIN' ? 'Administration complete' : 'Visible pour ADMIN uniquement'}
          />
          <StatCard
            label="Projets accessibles"
            value={stats.projects}
            hint={
              role === 'EMPLOYE'
                ? 'Visible pour ADMIN/MANAGER'
                : role === 'MANAGER'
                  ? 'Vos projets'
                  : 'Tous les projets'
            }
          />
          <StatCard
            label="Taches visibles"
            value={stats.tasks}
            hint={
              role === 'EMPLOYE'
                ? 'Uniquement vos taches'
                : role === 'MANAGER'
                  ? 'Taches de vos projets'
                  : 'Toutes les taches'
            }
          />
        </div>
        {loading ? <StatusMessage type="info">Chargement des statistiques...</StatusMessage> : null}
        <StatusMessage type="success">{status}</StatusMessage>
        <StatusMessage type="error">{error}</StatusMessage>
      </FormCard>

      <FormCard title="Guide rapide" subtitle="Flux metier recommande">
        <ol className="pm-guide-list">
          <li>Connexion avec un compte admin ou manager.</li>
          <li>Configurer les utilisateurs (ADMIN) et leurs roles.</li>
          <li>Creer les projets (MANAGER) puis assigner les taches.</li>
          <li>Suivre l avancement et mettre a jour les statuts tickets.</li>
        </ol>
      </FormCard>
    </>
  )
}
