import { useEffect, useMemo } from 'react'
import { AppShell } from '../../layouts/AppShell/AppShell'
import { PATHS } from '../../routes/paths'
import { useAuth } from '../../services/auth/AuthContext'
import { OverviewPage } from './pages/OverviewPage'
import { ProfilePage } from '../profile/pages/ProfilePage'
import { UsersPage } from '../users/pages/UsersPage'
import { ProjectsPage } from '../projects/pages/ProjectsPage'
import { TasksPage } from '../tasks/pages/TasksPage'

function buildNavigation(role) {
  const nav = [
    { path: PATHS.dashboard, label: 'Vue globale', title: 'Vue globale de la plateforme' },
    { path: PATHS.profile, label: 'Mon profil', title: 'Gestion de votre compte' },
    { path: PATHS.tasks, label: 'Taches', title: 'Gestion des taches et tickets' },
  ]

  if (role === 'ADMIN') {
    nav.splice(2, 0, {
      path: PATHS.users,
      label: 'Utilisateurs',
      title: 'Administration des utilisateurs',
      badge: 'ADMIN',
    })
    nav.splice(3, 0, {
      path: PATHS.projects,
      label: 'Projets',
      title: 'Supervision des projets',
    })
  }

  if (role === 'MANAGER') {
    nav.splice(2, 0, {
      path: PATHS.projects,
      label: 'Projets',
      title: 'Gestion de vos projets',
      badge: 'MANAGER',
    })
  }

  return nav
}

export function PlatformApp({ path, navigate, onLogout }) {
  const { user, role } = useAuth()

  const navItems = useMemo(() => buildNavigation(role), [role])
  const allowedPaths = useMemo(() => new Set(navItems.map((item) => item.path)), [navItems])

  useEffect(() => {
    if (!allowedPaths.has(path)) {
      navigate(navItems[0].path, { replace: true })
    }
  }, [allowedPaths, navItems, navigate, path])

  let content = <OverviewPage role={role} />

  if (path === PATHS.profile) {
    content = <ProfilePage />
  }
  if (path === PATHS.users && role === 'ADMIN') {
    content = <UsersPage />
  }
  if (path === PATHS.projects && (role === 'ADMIN' || role === 'MANAGER')) {
    content = <ProjectsPage role={role} />
  }
  if (path === PATHS.tasks) {
    content = <TasksPage role={role} />
  }

  return (
    <AppShell
      logoSrc="/projectmanager.png"
      title="Project Manager"
      subtitle="Workflows metier, securises et orientes production"
      navItems={navItems}
      currentPath={path}
      onNavigate={(next) => navigate(next)}
      user={user}
      onLogout={onLogout}
    >
      {content}
    </AppShell>
  )
}
