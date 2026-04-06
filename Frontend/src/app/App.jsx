import { useEffect } from 'react'
import { AuthProvider, useAuth } from '../services/auth/AuthContext'
import { useRouter } from '../routes/router'
import { GUEST_ONLY_PATHS, PATHS } from '../routes/paths'
import { LoginPage } from '../features/auth/pages/LoginPage'
import { RegisterPage } from '../features/auth/pages/RegisterPage'
import { PlatformApp } from '../features/platform/PlatformApp'

const PAGE_TITLES = {
  [PATHS.login]: 'Connexion',
  [PATHS.register]: 'Inscription',
  [PATHS.dashboard]: 'Tableau de bord',
  [PATHS.profile]: 'Mon profil',
  [PATHS.users]: 'Gestion utilisateurs',
  [PATHS.projects]: 'Gestion projets',
  [PATHS.tasks]: 'Gestion taches',
}

function AppContent() {
  const { path, navigate } = useRouter()
  const { isAuthenticated, isReady, logout } = useAuth()

  useEffect(() => {
    if (path === PATHS.root) {
      navigate(isAuthenticated ? PATHS.dashboard : PATHS.login, { replace: true })
    }
  }, [isAuthenticated, navigate, path])

  useEffect(() => {
    if (!isReady) return

    if (!isAuthenticated && !GUEST_ONLY_PATHS.has(path)) {
      navigate(PATHS.login, { replace: true })
      return
    }

    if (isAuthenticated && GUEST_ONLY_PATHS.has(path)) {
      navigate(PATHS.dashboard, { replace: true })
    }
  }, [isAuthenticated, isReady, navigate, path])

  useEffect(() => {
    const pageTitle = PAGE_TITLES[path] || 'Plateforme'
    document.title = `Project Manager | ${pageTitle}`
  }, [path])

  const goLogin = () => navigate(PATHS.login)
  const goRegister = () => navigate(PATHS.register)
  const handleLogout = () => {
    logout()
    navigate(PATHS.login, { replace: true })
  }

  const isAuthPage = path === PATHS.login || path === PATHS.register

  if (!isReady) {
    return <div className="pm-loading-full">Chargement de la session...</div>
  }

  if (isAuthPage) {
    return (
      <div className="pm-auth-layout">
        <aside className="pm-auth-brand">
          <img src="/projectmanager.png" alt="Project Manager" />
          <h1>Project Manager Platform</h1>
          <p>Planifie, attribue et pilote les projets de maniere professionnelle.</p>
          <div className="pm-auth-brand-links">
            <button type="button" onClick={goLogin}>
              Connexion
            </button>
            <button type="button" className="pm-link-btn" onClick={goRegister}>
              Inscription
            </button>
          </div>
        </aside>

        <main className="pm-auth-main">
          {path === PATHS.login ? <LoginPage onGoRegister={goRegister} /> : null}
          {path === PATHS.register ? <RegisterPage onGoLogin={goLogin} /> : null}
        </main>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <div className="pm-loading-full">Redirection vers la connexion...</div>
  }

  return (
    <PlatformApp
      path={path}
      navigate={navigate}
      onLogout={handleLogout}
    />
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
