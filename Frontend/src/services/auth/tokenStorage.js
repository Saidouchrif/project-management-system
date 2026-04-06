const ACCESS_TOKEN_KEY = 'pm_access_token'
const REFRESH_TOKEN_KEY = 'pm_refresh_token'

export const tokenStorage = {
  getAccessToken() {
    return window.sessionStorage.getItem(ACCESS_TOKEN_KEY)
  },

  setAccessToken(token) {
    if (!token) return
    window.sessionStorage.setItem(ACCESS_TOKEN_KEY, token)
  },

  clearAccessToken() {
    window.sessionStorage.removeItem(ACCESS_TOKEN_KEY)
  },

  getRefreshToken() {
    return window.localStorage.getItem(REFRESH_TOKEN_KEY)
  },

  setRefreshToken(token) {
    if (!token) return
    window.localStorage.setItem(REFRESH_TOKEN_KEY, token)
  },

  clearRefreshToken() {
    window.localStorage.removeItem(REFRESH_TOKEN_KEY)
  },

  clearAll() {
    this.clearAccessToken()
    this.clearRefreshToken()
  },
}
