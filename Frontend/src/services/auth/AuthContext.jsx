import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { authApi } from './authApi'
import { tokenStorage } from './tokenStorage'
import { usersApi } from '../users/usersApi'
import { setAuthHandlers } from '../http/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(tokenStorage.getAccessToken())
  const [refreshToken, setRefreshToken] = useState(tokenStorage.getRefreshToken())
  const [role, setRole] = useState(null)
  const [user, setUser] = useState(null)
  const [isReady, setIsReady] = useState(false)

  const clearSession = useCallback(() => {
    tokenStorage.clearAll()
    setAccessToken(null)
    setRefreshToken(null)
    setRole(null)
    setUser(null)
  }, [])

  const refreshAccessToken = useCallback(async () => {
    const currentRefreshToken = tokenStorage.getRefreshToken()
    if (!currentRefreshToken) return null

    try {
      const response = await authApi.refresh(currentRefreshToken)
      if (!response?.accessToken) {
        clearSession()
        return null
      }
      tokenStorage.setAccessToken(response.accessToken)
      setAccessToken(response.accessToken)
      return response.accessToken
    } catch {
      clearSession()
      return null
    }
  }, [clearSession])

  const loadCurrentProfile = useCallback(async () => {
    const profileResponse = await usersApi.getMyProfile()
    const profile = profileResponse?.data || null
    setUser(profile)
    if (profile?.role) {
      setRole(profile.role)
    }
    return profile
  }, [])

  const login = useCallback(
    async (credentials) => {
      const response = await authApi.login(credentials)

      tokenStorage.setAccessToken(response.accessToken)
      tokenStorage.setRefreshToken(response.refreshToken)

      setAccessToken(response.accessToken)
      setRefreshToken(response.refreshToken)
      setRole(response.role || null)

      await loadCurrentProfile()
      return response
    },
    [loadCurrentProfile],
  )

  const register = useCallback(async (payload) => {
    return authApi.register(payload)
  }, [])

  const logout = useCallback(() => {
    clearSession()
  }, [clearSession])

  const refreshSession = useCallback(async () => {
    const newToken = await refreshAccessToken()
    if (!newToken) {
      throw new Error('Session expiree, reconnecte-toi')
    }
    return newToken
  }, [refreshAccessToken])

  useEffect(() => {
    setAuthHandlers({
      getAccessToken: () => tokenStorage.getAccessToken(),
      refreshAccessToken,
      onAuthFailure: clearSession,
    })
  }, [clearSession, refreshAccessToken])

  useEffect(() => {
    let isCancelled = false

    async function bootstrap() {
      const storedAccessToken = tokenStorage.getAccessToken()
      if (!storedAccessToken) {
        if (!isCancelled) {
          setIsReady(true)
        }
        return
      }

      try {
        await loadCurrentProfile()
      } catch {
        const refreshed = await refreshAccessToken()
        if (refreshed) {
          try {
            await loadCurrentProfile()
          } catch {
            clearSession()
          }
        } else {
          clearSession()
        }
      } finally {
        if (!isCancelled) {
          setIsReady(true)
        }
      }
    }

    bootstrap()
    return () => {
      isCancelled = true
    }
  }, [clearSession, loadCurrentProfile, refreshAccessToken])

  const value = useMemo(
    () => ({
      accessToken,
      refreshToken,
      role,
      user,
      isReady,
      isAuthenticated: Boolean(accessToken),
      login,
      register,
      logout,
      refreshSession,
      reloadProfile: loadCurrentProfile,
    }),
    [
      accessToken,
      isReady,
      loadCurrentProfile,
      login,
      logout,
      refreshSession,
      refreshToken,
      register,
      role,
      user,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return context
}
