# Project Management Backend - Documentation API Complete

## 1. Vue d ensemble

Ce backend est une API REST Spring Boot pour la gestion de:

- utilisateurs (`ADMIN`, `MANAGER`, `EMPLOYE`)
- projets
- taches (tickets)
- authentification JWT

Base de donnees: PostgreSQL  
Securite: Spring Security + JWT (stateless)  
Suppression logique: `deletedAt` (soft delete) sur `User`, `Project`, `Task`.

## 2. Regles metier (acces)

- `register` public cree toujours un utilisateur `EMPLOYE`.
- `ADMIN` gere les utilisateurs (creation, suppression, restauration, changement de role).
- `MANAGER` cree des projets.
- `MANAGER` assigne des taches uniquement dans ses propres projets, et uniquement a des `EMPLOYE`.
- `EMPLOYE` peut changer uniquement le statut de ses propres taches.
- `ADMIN` voit tout, `MANAGER` voit ses projets/taches, `EMPLOYE` voit ses taches.

## 3. Authentification JWT

Routes publiques:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`

Toutes les autres routes exigent:

`Authorization: Bearer <accessToken>`

## 4. Variables d environnement

Le projet peut marcher avec `application.properties`, mais en Docker Compose on injecte ces variables:

- `SPRING_DATASOURCE_URL`
- `SPRING_DATASOURCE_USERNAME`
- `SPRING_DATASOURCE_PASSWORD`
- `JWT_SECRET`
- `APP_ADMIN_EMAIL`
- `APP_ADMIN_PASSWORD`
- `APP_ADMIN_NAME`

Admin bootstrap (au demarrage):

- si aucun `ADMIN` actif n existe, un compte admin est cree automatiquement.
- valeurs par defaut en Docker actuel:
- email: `admin@pms.local`
- password: `admin123`
- name: `System Admin`

## 5. Format de reponse API

La plupart des endpoints retournent un `Map<String,Object>` avec typiquement:

- succes: `message`, parfois `data`, parfois `accessToken`/`refreshToken`
- erreur: `error`

Exemple succes:

```json
{
  "message": "Task created",
  "data": {
    "id": 10,
    "title": "Creer endpoint",
    "status": "TODO"
  }
}
```

Exemple erreur:

```json
{
  "error": "Only ADMIN can create users"
}
```

## 6. Routes API detaillees (avec JSON a envoyer)

Base URL locale: `http://localhost:8080`

### 6.1 Auth

### POST `/api/auth/register`

Acces: Public  
Description: creer un compte utilisateur en `EMPLOYE` (role force cote backend).

Body JSON:

```json
{
  "name": "Ali",
  "email": "ali@example.com",
  "password": "123456"
}
```

Note: meme si tu envoies `"role": "ADMIN"`, le backend met `EMPLOYE`.

### POST `/api/auth/login`

Acces: Public  
Description: authentifier et recuperer tokens JWT.

Body JSON:

```json
{
  "email": "admin@pms.local",
  "password": "admin123"
}
```

Reponse succes (exemple):

```json
{
  "message": "Login successful",
  "accessToken": "<JWT_ACCESS_TOKEN>",
  "refreshToken": "<JWT_REFRESH_TOKEN>",
  "role": "ADMIN"
}
```

### POST `/api/auth/refresh?refreshToken=...`

Acces: Public  
Description: regenerer un `accessToken`.

Body JSON: Aucun.

Exemple appel:

`POST /api/auth/refresh?refreshToken=<JWT_REFRESH_TOKEN>`

### GET `/api/auth/me`

Acces: Authentifie (`Bearer`)  
Description: recuperer utilisateur courant.

Body JSON: Aucun.

### 6.2 Utilisateurs

### POST `/api/users?role=ADMIN|MANAGER|EMPLOYE`

Acces: `ADMIN`  
Description: creer un utilisateur avec role choisi par l admin.

Body JSON:

```json
{
  "name": "Manager 1",
  "email": "manager1@example.com",
  "password": "123456"
}
```

### PUT `/api/users/{id}/role?role=ADMIN|MANAGER|EMPLOYE`

Acces: `ADMIN`  
Description: changer le role d un utilisateur existant.

Body JSON: Aucun.

### GET `/api/users`

Acces: `ADMIN`  
Description: lister utilisateurs actifs (`deletedAt is null`).

Body JSON: Aucun.

### DELETE `/api/users/{id}`

Acces: `ADMIN`  
Description: suppression logique utilisateur (`deletedAt`).

Body JSON: Aucun.

### PUT `/api/users/restore/{id}`

Acces: `ADMIN`  
Description: restaurer utilisateur supprime logiquement.

Body JSON: Aucun.

### 6.3 Projets

### POST `/api/projects`

Acces: `MANAGER`  
Description: creer un projet (manager courant devient proprietaire).

Body JSON:

```json
{
  "name": "Projet CRM",
  "description": "Migration CRM interne"
}
```

### GET `/api/projects`

Acces: `ADMIN`, `MANAGER`  
Description:

- `ADMIN`: tous les projets actifs
- `MANAGER`: uniquement ses projets actifs

Body JSON: Aucun.

### DELETE `/api/projects/{id}`

Acces: `ADMIN`, `MANAGER`  
Description:

- `ADMIN`: peut supprimer n importe quel projet
- `MANAGER`: seulement ses projets

Body JSON: Aucun.

### PUT `/api/projects/restore/{id}`

Acces: `ADMIN`, `MANAGER`  
Description:

- `ADMIN`: restaurer tout projet
- `MANAGER`: restaurer seulement ses projets

Body JSON: Aucun.

### 6.4 Taches

### POST `/api/tasks?projectId={projectId}&userId={userId}`

Acces: `MANAGER`  
Description:

- assigne une tache a un `EMPLOYE`
- le projet doit appartenir au manager connecte

Body JSON:

```json
{
  "title": "Creer ecran login",
  "description": "Faire page login React",
  "status": "TODO"
}
```

`status` autorise: `TODO`, `IN_PROGRESS`, `DONE`  
Si absent, backend met `TODO`.

### GET `/api/tasks`

Acces: `ADMIN`, `MANAGER`, `EMPLOYE`  
Description:

- `ADMIN`: toutes les taches actives
- `MANAGER`: taches de ses projets
- `EMPLOYE`: ses taches assignees

Body JSON: Aucun.

### GET `/api/tasks/user/{userId}`

Acces: `ADMIN`, `MANAGER`, `EMPLOYE`  
Description:

- `EMPLOYE`: uniquement son propre `userId`
- `MANAGER`: taches de cet utilisateur mais filtrees sur les projets du manager
- `ADMIN`: toutes les taches de cet utilisateur

Body JSON: Aucun.

### DELETE `/api/tasks/{id}`

Acces: `ADMIN`, `MANAGER`  
Description:

- `ADMIN`: peut supprimer toute tache
- `MANAGER`: seulement les taches de ses projets

Body JSON: Aucun.

### PUT `/api/tasks/restore/{id}`

Acces: `ADMIN`, `MANAGER`  
Description:

- `ADMIN`: restaurer toute tache
- `MANAGER`: seulement les taches de ses projets

Body JSON: Aucun.

### PATCH `/api/tasks/{id}/status?status=TODO|IN_PROGRESS|DONE`

Acces: `EMPLOYE`  
Description:

- l employe peut modifier le statut uniquement de sa propre tache

Body JSON: Aucun.

Exemple appel:

`PATCH /api/tasks/12/status?status=IN_PROGRESS`

## 7. JSON cote Frontend (resume rapide)

Quand tu appelles depuis le frontend:

- Mettre `Content-Type: application/json` pour les routes avec body.
- Mettre `Authorization: Bearer <accessToken>` sur toutes les routes privees.
- Utiliser `params` URL pour les routes qui demandent `@RequestParam`:
- `/api/auth/refresh?refreshToken=...`
- `/api/users?role=...`
- `/api/users/{id}/role?role=...`
- `/api/tasks?projectId=...&userId=...`
- `/api/tasks/{id}/status?status=...`

## 8. Exemple d ordre d integration Frontend

1. Login admin (`/api/auth/login`)
2. Creer manager (`POST /api/users?role=MANAGER`)
3. Login manager
4. Creer projet (`POST /api/projects`)
5. Admin cree ou manager utilise employe existant
6. Manager cree tache (`POST /api/tasks?projectId=...&userId=...`)
7. Login employe
8. Employe change statut (`PATCH /api/tasks/{id}/status?status=DONE`)
