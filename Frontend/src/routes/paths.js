export const PATHS = {
  root: '/',
  login: '/login',
  register: '/register',
  dashboard: '/dashboard',
}

export const GUEST_ONLY_PATHS = new Set([PATHS.login, PATHS.register])
