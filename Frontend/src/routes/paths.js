export const PATHS = {
  root: '/',
  login: '/login',
  register: '/register',
  dashboard: '/dashboard',
  profile: '/profile',
  users: '/users/list',
  usersList: '/users/list',
  usersCreate: '/users/create',
  usersDeleted: '/users/deleted',
  projects: '/projects/list',
  projectsList: '/projects/list',
  projectsCreate: '/projects/create',
  projectsDeleted: '/projects/deleted',
  tasks: '/tasks/board',
  tasksBoard: '/tasks/board',
  tasksCreate: '/tasks/create',
  tasksByUser: '/tasks/by-user',
  tasksDeleted: '/tasks/deleted',
}

export const GUEST_ONLY_PATHS = new Set([PATHS.login, PATHS.register])
