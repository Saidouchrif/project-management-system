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
    {
      path: PATHS.dashboard,
      label: 'Vue globale',
      title: 'Vue globale de la plateforme',
    },
    {
      path: PATHS.profile,
      label: 'Mon profil',
      title: 'Gestion de votre compte',
    },
  ]

  if (role === 'ADMIN') {
    nav.push(
      {
        path: PATHS.usersList,
        matchPrefix: '/users/',
        label: 'Utilisateurs',
        title: 'Administration des utilisateurs',
        badge: 'ADMIN',
      },
      {
        path: PATHS.projectsList,
        matchPrefix: '/projects/',
        label: 'Projets',
        title: 'Supervision des projets',
      },
    )
  }

  if (role === 'MANAGER') {
    nav.push({
      path: PATHS.projectsList,
      matchPrefix: '/projects/',
      label: 'Projets',
      title: 'Gestion de vos projets',
      badge: 'MANAGER',
    })
  }

  nav.push({
    path: PATHS.tasksBoard,
    matchPrefix: '/tasks/',
    label: 'Taches',
    title: 'Gestion des taches et tickets',
  })

  return nav
}

function isAllowedPath(path, role) {
  if (path === PATHS.dashboard || path === PATHS.profile) {
    return true
  }

  if (role === 'ADMIN') {
    return path.startsWith('/users/') || path.startsWith('/projects/') || path.startsWith('/tasks/')
  }

  if (role === 'MANAGER') {
    return path.startsWith('/projects/') || path.startsWith('/tasks/')
  }

  return path.startsWith('/tasks/')
}

export function PlatformApp({ path, navigate, onLogout }) {
  const { user, role } = useAuth()

  const navItems = useMemo(() => buildNavigation(role), [role])

  useEffect(() => {
    if (!isAllowedPath(path, role)) {
      navigate(PATHS.dashboard, { replace: true })
      return
    }

    if (path === '/users' && role === 'ADMIN') {
      navigate(PATHS.usersList, { replace: true })
      return
    }

    if (path === '/projects' && (role === 'ADMIN' || role === 'MANAGER')) {
      navigate(PATHS.projectsList, { replace: true })
      return
    }

    if (path === '/tasks') {
      navigate(PATHS.tasksBoard, { replace: true })
    }
  }, [navigate, path, role])

  let content = <OverviewPage role={role} />

  if (path === PATHS.profile) {
    content = <ProfilePage />
  }

  if (path.startsWith('/users/') && role === 'ADMIN') {
    content = <UsersPage path={path} navigate={navigate} />
  }

  if (path.startsWith('/projects/') && (role === 'ADMIN' || role === 'MANAGER')) {
    content = <ProjectsPage role={role} path={path} navigate={navigate} />
  }

  if (path.startsWith('/tasks/')) {
    content = <TasksPage role={role} path={path} navigate={navigate} />
  }

  return (
    <AppShell
      logoSrc="/projectmanager.png"
      title="Project Manager"
      subtitle="Pilotage projet professionnel"
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
