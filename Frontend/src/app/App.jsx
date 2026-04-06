import { useEffect } from 'react'
import { AuthProvider, useAuth } from '../services/auth/AuthContext'
import { useRouter } from '../routes/router'
import { GUEST_ONLY_PATHS, PATHS } from '../routes/paths'
import { AppShell } from '../layouts/AppShell/AppShell'
import { LoginPage } from '../features/auth/pages/LoginPage'
import { RegisterPage } from '../features/auth/pages/RegisterPage'
import { DashboardPage } from '../features/dashboard/pages/DashboardPage'

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

  const goLogin = () => navigate(PATHS.login)
  const goRegister = () => navigate(PATHS.register)
  const goDashboard = () => navigate(PATHS.dashboard)
  const handleLogout = () => {
    logout()
    navigate(PATHS.login, { replace: true })
  }

  const isAuthPage = path === PATHS.login || path === PATHS.register

  return (
    <AppShell
      logoSrc="/projectmanager.png"
      title="Project Manager"
      subtitle="React Frontend complet connecte a toutes les routes backend"
      topRight={
        isAuthPage ? (
          <div className="pm-action-row">
            <button type="button" onClick={goLogin}>
              Login
            </button>
            <button type="button" onClick={goRegister}>
              Register
            </button>
          </div>
        ) : (
          <div className="pm-action-row">
            <button type="button" onClick={goDashboard}>
              Dashboard
            </button>
            <button type="button" className="pm-btn pm-btn-danger" onClick={handleLogout}>
              Logout
            </button>
          </div>
        )
      }
    >
      {!isReady ? <div className="pm-loading">Chargement de la session...</div> : null}

      {isReady && path === PATHS.login ? <LoginPage onGoRegister={goRegister} /> : null}
      {isReady && path === PATHS.register ? <RegisterPage onGoLogin={goLogin} /> : null}
      {isReady && path === PATHS.dashboard && isAuthenticated ? (
        <DashboardPage onLogout={handleLogout} />
      ) : null}
    </AppShell>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
