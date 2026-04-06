export const PATHS = {
  root: '/',
  login: '/login',
  register: '/register',
  dashboard: '/dashboard',
  profile: '/profile',
  users: '/users',
  projects: '/projects',
  tasks: '/tasks',
}

export const GUEST_ONLY_PATHS = new Set([PATHS.login, PATHS.register])
