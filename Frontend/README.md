# Frontend Project Manager (React + Vite)

Frontend complet connecte au backend Spring Boot du projet `project-management-system`.

## 1) Stack

- React 19
- Vite 8
- Fetch API (client HTTP centralise)
- Auth JWT avec access token + refresh token

## 2) Architecture

```text
Frontend/
  public/
    projectmanager.png
  src/
    app/
      App.jsx
    routes/
      paths.js
      router.js
    services/
      http/
        client.js
        unwrap.js
      auth/
        AuthContext.jsx
        authApi.js
        tokenStorage.js
      users/
        usersApi.js
      projects/
        projectsApi.js
      tasks/
        tasksApi.js
    layouts/
      AppShell/
        AppShell.jsx
    components/
      ui/
        FormCard.jsx
        StatusMessage.jsx
    features/
      auth/
        pages/
          LoginPage.jsx
          RegisterPage.jsx
      dashboard/
        pages/
          DashboardPage.jsx
      shared/
        extractErrorMessage.js
    main.jsx
    index.css
```

## 3) Configuration

Creer un fichier `.env` dans `Frontend/` si besoin:

```env
VITE_API_URL=http://localhost:8080
```

Si absent, le frontend utilise `http://localhost:8080` par defaut.

## 4) Lancement local

```bash
npm install
npm run dev -- --host 0.0.0.0 --port 5173
```

## 5) Routes frontend

- `/login`
- `/register`
- `/dashboard`

Comportement:

- non authentifie + route privee => redirection `/login`
- authentifie + route guest => redirection `/dashboard`

## 6) Strategie Auth

- access token: `sessionStorage`
- refresh token: `localStorage`
- retry automatique apres refresh en cas de `401`
- logout auto si refresh invalide

## 7) Couverture backend

Le dashboard expose toutes les routes backend:

- Auth:
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `POST /api/auth/refresh`
  - `GET /api/auth/me`
- Self profile:
  - `GET /api/users/me`
  - `PUT /api/users/me`
  - `PUT /api/users/me/password`
- Admin users:
  - `POST /api/users?role=...`
  - `PUT /api/users/{id}/role?role=...`
  - `GET /api/users`
  - `DELETE /api/users/{id}`
  - `PUT /api/users/restore/{id}`
- Projects:
  - `POST /api/projects`
  - `GET /api/projects`
  - `DELETE /api/projects/{id}`
  - `PUT /api/projects/restore/{id}`
- Tasks:
  - `POST /api/tasks?projectId=...&userId=...`
  - `GET /api/tasks`
  - `GET /api/tasks/user/{userId}`
  - `DELETE /api/tasks/{id}`
  - `PUT /api/tasks/restore/{id}`
  - `PATCH /api/tasks/{id}/status?status=...`

## 8) Branding

Le logo application est integre dans:

- topbar principale
- pages auth

Source logo:

- `Frontend/public/projectmanager.png`
