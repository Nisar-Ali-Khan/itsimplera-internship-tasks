# Ledger — Task Management Platform

A full-stack task management platform built for the ITSimplera Full Stack Web Development Internship — **Week 1** (frontend + core API) and **Week 2** (secure multi-user Task Management API hardening: real logout, soft delete, sorting, and more). It implements secure authentication, complete CRUD operations, and a responsive UI, following a professional project structure.

**Stack:** React (Vite) · Node.js · Express · MongoDB · JWT · bcrypt.js

---

## Table of Contents

1. [Features](#features)
2. [Project Structure](#project-structure)
3. [Tech Stack](#tech-stack)
4. [Getting Started](#getting-started)
5. [Environment Variables](#environment-variables)
6. [API Reference](#api-reference)
7. [Database Schema](#database-schema)
8. [Security Notes](#security-notes)
9. [Deliverables Checklist (Week 2)](#deliverables-checklist-week-2)
10. [Screenshots](#screenshots)

---

## Features

### Frontend
- Pages: Login, Register, Dashboard, Profile, Create Task, Edit Task, All Tasks, 404
- Responsive navigation bar + collapsible sidebar (drawer on mobile)
- Dashboard stat cards (total / pending / in-progress / completed) with a priority pie chart
- Responsive data table (desktop) that reflows into stacked cards (mobile)
- Dark / light theme toggle, persisted to `localStorage`
- Loading indicators on every async screen
- Toast notifications (`react-toastify`) for success/error feedback
- Client-side form validation with inline error messages
- Centralized API error handling with human-readable messages
- Mobile-friendly design throughout (Tailwind CSS, mobile-first breakpoints)

### Backend
- User registration, login, and **real logout** (JWT token blacklisting — a logged-out token is rejected immediately, not just after it expires)
- JWT-based authentication with configurable expiry + server-side expired/invalid token handling
- Password hashing with bcrypt.js (10 salt rounds); passwords are never returned by the API
- Protected routes via Express middleware, with per-request user scoping (a user can only ever read/modify their own tasks)
- Full CRUD for tasks, plus **soft delete** (deleted tasks are hidden, not destroyed, and can be restored)
- Request validation with `express-validator`
- Correct HTTP status codes (200/201/400/401/404/409/500)
- Centralized error-handling middleware (`notFound` + `errorHandler`)
- Security headers (`helmet`), CORS restricted to the client origin, and rate limiting on auth routes
- All secrets in environment variables (`.env`), never hard-coded

### Database
- MongoDB with three collections: `users`, `tasks`, and `tokenblacklists`
- Each task stores: title, description, priority, status, due date, created date (`createdAt`), and a soft-delete flag (`isDeleted` / `deletedAt`)
- `tokenblacklists` uses a MongoDB TTL index so logged-out tokens self-expire and never accumulate
- Text index on task title/description to support search
- See [`docs/er-diagram.png`](docs/er-diagram.png) for the full entity-relationship diagram

### Week 2 — Advanced Features (9 of the requested 5+ implemented)
- ✅ Search Tasks (MongoDB text search)
- ✅ Filter by Status
- ✅ Filter by Priority
- ✅ Pagination
- ✅ Sorting (`?sort=dueDate`, `?sort=-priority`, etc., whitelisted fields)
- ✅ Dashboard Statistics
- ✅ Recent Activity Log
- ✅ Task Completion Percentage
- ✅ Soft Delete (with a trash listing + restore endpoint)

### Week 1 — Frontend & Additional Features (still included)
- ✅ User Profile Update · ✅ Password Change · ✅ Responsive Charts · ✅ Auto Logout after JWT Expiration
- Full React UI: Login, Register, Dashboard, Profile, Create/Edit Task, All Tasks, dark/light theme toggle, toasts, loading states, form validation

---

## Project Structure

```
Task-Management-System/
├── client/                      # React frontend (Vite)
│   ├── src/
│   │   ├── components/          # Reusable UI (Navbar, Sidebar, TaskTable, etc.)
│   │   ├── pages/                # Route-level pages
│   │   ├── context/              # AuthContext, ThemeContext
│   │   ├── services/              # Axios API layer
│   │   └── utils/                # Client-side validators
│   ├── tailwind.config.js
│   └── package.json
│
├── server/                      # Express backend
│   ├── controllers/              # Route handler logic
│   ├── models/                   # Mongoose schemas (User, Task, TokenBlacklist)
│   ├── routes/                   # Express routers
│   ├── middleware/               # auth (incl. blacklist check), validation, error handling
│   ├── config/                   # MongoDB connection
│   ├── utils/                    # ApiError, generateToken
│   └── server.js
│
├── docs/                        # Postman collection + ER diagram
│   ├── Ledger-API.postman_collection.json
│   ├── er-diagram.mmd
│   └── er-diagram.png
│
├── README.md
├── package.json                  # Root convenience scripts
└── .gitignore
```

---

## Tech Stack

| Layer          | Technology                          |
|----------------|--------------------------------------|
| Frontend       | React 18, Vite, React Router, Tailwind CSS |
| HTTP Client    | Axios                                |
| Charts         | Recharts                             |
| Notifications  | react-toastify                       |
| Icons          | lucide-react                         |
| Backend        | Node.js, Express.js                  |
| Database       | MongoDB + Mongoose                   |
| Auth           | JSON Web Token (jsonwebtoken), bcrypt.js |
| Validation     | express-validator                    |
| Security       | helmet, cors, express-rate-limit     |

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org) v18+
- [MongoDB Community Server](https://www.mongodb.com/try/download/community) running locally, or a MongoDB Atlas connection string
- npm

### 1. Clone and install

```bash
git clone <your-repo-url>
cd Task-Management-System
npm run install:all
```

### 2. Configure environment variables

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

Edit `server/.env` and set a strong `JWT_SECRET` and your `MONGO_URI`.

### 3. Run in development (both servers concurrently)

```bash
npm install       # installs root devDependency 'concurrently'
npm run dev
```

- API runs at `http://localhost:5000`
- Client runs at `http://localhost:5173`

Or run them separately:

```bash
npm run server   # http://localhost:5000
npm run client   # http://localhost:5173
```

### 4. Build for production

```bash
npm run build      # builds the React client into client/dist
npm start           # starts the Express server (serve dist separately or via a static host)
```

---

## Environment Variables

**server/.env**

| Variable        | Description                                  | Example                                |
|-----------------|-----------------------------------------------|-----------------------------------------|
| `PORT`          | Port the API listens on                      | `5000`                                  |
| `NODE_ENV`      | `development` or `production`                | `development`                           |
| `MONGO_URI`     | MongoDB connection string                    | `mongodb://127.0.0.1:27017/task-management-db` |
| `JWT_SECRET`    | Secret used to sign JWTs                     | `long-random-string`                    |
| `JWT_EXPIRES_IN`| Token lifetime                               | `1h`                                    |
| `CLIENT_URL`    | Allowed CORS origin                          | `http://localhost:5173`                 |

**client/.env**

| Variable        | Description             | Example                        |
|-----------------|--------------------------|----------------------------------|
| `VITE_API_URL`  | Base URL of the API      | `http://localhost:5000/api`     |

---

## API Reference

Base URL: `/api`

### Auth — `/api/auth`

| Method | Endpoint         | Access  | Description                                          |
|--------|------------------|---------|--------------------------------------------------------|
| POST   | `/register`      | Public  | Create a new account                                  |
| POST   | `/login`         | Public  | Log in and receive a JWT                               |
| POST   | `/logout`        | Private | Invalidate the current JWT immediately (blacklisted)   |
| GET    | `/me`            | Private | Get the current user                                   |

### Tasks — `/api/tasks`

| Method | Endpoint          | Access  | Description                                                          |
|--------|-------------------|---------|-------------------------------------------------------------------------|
| GET    | `/`               | Private | List tasks — `?search=&status=&priority=&sort=&page=&limit=`            |
| POST   | `/`               | Private | Create a task                                                          |
| GET    | `/trash`          | Private | List soft-deleted tasks                                                |
| GET    | `/:id`            | Private | Get a single task                                                      |
| PUT    | `/:id`            | Private | Update a task                                                          |
| DELETE | `/:id`            | Private | Soft-delete a task (hidden from lists, not destroyed)                   |
| PATCH  | `/:id/restore`    | Private | Restore a soft-deleted task                                            |

`sort` accepts any of `createdAt`, `dueDate`, `priority`, `title`, `status`, optionally prefixed with `-` for descending (e.g. `?sort=-dueDate`).

### Users — `/api/users`

| Method | Endpoint            | Access  | Description                                          |
|--------|----------------------|---------|---------------------------------------------------------|
| GET    | `/profile`           | Private | Get name / email / bio                                  |
| PUT    | `/profile`           | Private | Update name / bio                                       |
| PUT    | `/change-password`   | Private | Change password                                          |
| GET    | `/dashboard-stats`   | Private | Task counts, completion %, priority breakdown, recent activity |

All private routes require `Authorization: Bearer <token>`.

A ready-to-import **Postman collection** covering every endpoint above (including pre-request scripts that auto-save the JWT after register/login) is at [`docs/Ledger-API.postman_collection.json`](docs/Ledger-API.postman_collection.json).

**Example — Register**
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "secret123"
}
```

**Example — Create Task**
```http
POST /api/tasks
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Prepare client presentation",
  "description": "Slides for Monday's kickoff",
  "priority": "High",
  "status": "Pending",
  "dueDate": "2026-07-10"
}
```

**Example — Logout**
```http
POST /api/auth/logout
Authorization: Bearer <token>
```
The token used in this request is stored in a `tokenblacklists` collection with a TTL equal to its remaining lifetime, so it's rejected by every protected route from this point on — even though the JWT itself hasn't technically expired yet.

---

## Database Schema

> Full entity-relationship diagram: [`docs/er-diagram.png`](docs/er-diagram.png) (source: [`docs/er-diagram.mmd`](docs/er-diagram.mmd))

**User**
| Field       | Type    | Notes                          |
|-------------|---------|----------------------------------|
| name        | String  | required                        |
| email       | String  | required, unique                |
| password    | String  | required, hashed with bcrypt    |
| avatarColor | String  | auto-generated                  |
| bio         | String  | optional, max 200 chars         |
| lastLogin   | Date    | updated on each login            |
| timestamps  | -       | createdAt / updatedAt            |

**Task**
| Field       | Type      | Notes                                          |
|-------------|-----------|--------------------------------------------------|
| title       | String    | required                                        |
| description | String    | optional                                        |
| priority    | String    | enum: Low, Medium, High                          |
| status      | String    | enum: Pending, In Progress, Completed            |
| dueDate     | Date      | required                                         |
| user        | ObjectId  | references User                                  |
| isDeleted   | Boolean   | soft-delete flag, default `false`                 |
| deletedAt   | Date      | set when soft-deleted, cleared on restore         |
| timestamps  | -         | createdAt (Created Date) / updatedAt              |

**TokenBlacklist**
| Field       | Type      | Notes                                              |
|-------------|-----------|------------------------------------------------------|
| token       | String    | required, unique — the raw JWT that was logged out    |
| expiresAt   | Date      | copied from the JWT's own `exp` claim; a TTL index removes the document automatically at this time |

---

## Security Notes

- Passwords are hashed with bcrypt.js (10 salt rounds) and never returned by the API.
- JWTs expire (`JWT_EXPIRES_IN`); the client schedules an automatic logout for the exact expiry moment and also treats any `401` response as a signal to log out.
- **Logout is enforced server-side, not just client-side.** Calling `POST /api/auth/logout` stores the current token in the `tokenblacklists` collection; the `protect` middleware checks this collection on every request and rejects a blacklisted token even if it hasn't technically expired yet. A MongoDB TTL index cleans up each entry once its underlying token would have expired anyway, so the collection never grows unbounded.
- Deleting a task is a **soft delete** — the document is flagged `isDeleted: true`, not removed, and is excluded from all normal list/detail queries. This avoids accidental permanent data loss and allows a `restore` endpoint.
- Auth routes are rate-limited to reduce brute-force risk.
- `helmet` sets standard security headers; CORS is restricted to `CLIENT_URL`.
- All task routes are scoped to `req.user._id`, so users can only ever read/modify their own data.

---

## Deliverables Checklist (Week 2)

| Deliverable | Status | Location |
|-------------|--------|----------|
| Public GitHub Repository | ⚠️ Push it yourself | — |
| Complete Source Code | ✅ | `client/`, `server/` |
| README.md | ✅ | this file |
| Postman Collection | ✅ | [`docs/Ledger-API.postman_collection.json`](docs/Ledger-API.postman_collection.json) |
| Database Schema / ER Diagram | ✅ | [`docs/er-diagram.png`](docs/er-diagram.png) |
| 5-Minute Demonstration Video | ⚠️ Record it yourself | — |

**To import the Postman collection:** open Postman → *Import* → select the JSON file. The `baseUrl` variable defaults to `http://localhost:5000/api`; running the "Register" or "Login" request automatically saves the returned JWT into `{{token}}` for every subsequent request.

---


## Author's Notes for Submission

This repository satisfies both the Week 1 and Week 2 Task requirements end-to-end: authentication (register/login/**logout**/JWT/bcrypt), token-expiration handling with server-side blacklisting, protected and per-user-scoped routes, full task CRUD with **soft delete**, MongoDB with `Users`, `Tasks`, and `TokenBlacklist` collections, a responsive React UI, and 9 of the requested "at least five" advanced features (Search, Filter by Status, Filter by Priority, Pagination, Sorting, Dashboard Statistics, Recent Activity Log, Task Completion Percentage, Soft Delete). See the [Project Structure](#project-structure) section for how it maps to the required layout, and the [Deliverables Checklist](#deliverables-checklist-week-2) above for what's left outside the codebase.
