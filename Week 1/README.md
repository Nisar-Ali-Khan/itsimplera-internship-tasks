# Ledger — Task Management Platform

A full-stack task management platform built for the ITSimplera Fullstack Web Development Internship — Week 1 Task. It implements secure authentication, complete CRUD operations, and a responsive UI, following a professional project structure.

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
9. [Screenshots](#screenshots)

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
- User registration & login with hashed passwords (bcrypt.js, 10 salt rounds)
- JWT-based authentication with configurable expiry
- Protected routes via Express middleware
- Full CRUD for tasks, scoped to the authenticated user
- Request validation with `express-validator`
- Correct HTTP status codes (200/201/400/401/404/409/500)
- Centralized error-handling middleware (`notFound` + `errorHandler`)
- Security headers (`helmet`), CORS restricted to the client origin, and rate limiting on auth routes

### Database
- MongoDB with two collections: `users` and `tasks`
- Each task stores: title, description, priority, status, due date, and created date (via `createdAt` timestamp)
- Text index on task title/description to support search

### Additional Features (6 of the requested 5+ implemented)
- ✅ Search Tasks (MongoDB text search)
- ✅ Filter by Status
- ✅ Filter by Priority
- ✅ Pagination
- ✅ User Profile Update
- ✅ Password Change
- ✅ Dashboard Statistics
- ✅ Recent Activity Panel
- ✅ Responsive Charts (priority breakdown pie chart)
- ✅ Auto Logout after JWT Expiration (client schedules logout at the exact token expiry time)

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
│   ├── models/                   # Mongoose schemas (User, Task)
│   ├── routes/                   # Express routers
│   ├── middleware/               # auth, validation, error handling
│   ├── config/                   # MongoDB connection
│   ├── utils/                    # ApiError, generateToken
│   └── server.js
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

| Method | Endpoint         | Access  | Description                  |
|--------|------------------|---------|-------------------------------|
| POST   | `/register`      | Public  | Create a new account          |
| POST   | `/login`         | Public  | Log in and receive a JWT      |
| GET    | `/me`            | Private | Get the current user          |

### Tasks — `/api/tasks`

| Method | Endpoint      | Access  | Description                                             |
|--------|---------------|---------|-----------------------------------------------------------|
| GET    | `/`           | Private | List tasks — supports `?search=&status=&priority=&page=&limit=` |
| POST   | `/`           | Private | Create a task                                            |
| GET    | `/:id`        | Private | Get a single task                                        |
| PUT    | `/:id`        | Private | Update a task                                             |
| DELETE | `/:id`        | Private | Delete a task                                             |

### Users — `/api/users`

| Method | Endpoint            | Access  | Description                        |
|--------|----------------------|---------|--------------------------------------|
| PUT    | `/profile`           | Private | Update name / bio                    |
| PUT    | `/change-password`   | Private | Change password                       |
| GET    | `/dashboard-stats`   | Private | Get task counts + recent activity     |

All private routes require `Authorization: Bearer <token>`.

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

---

## Database Schema

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
| timestamps  | -         | createdAt (Created Date) / updatedAt              |

---

## Security Notes

- Passwords are hashed with bcrypt.js (10 salt rounds) and never returned by the API.
- JWTs expire (`JWT_EXPIRES_IN`); the client schedules an automatic logout for the exact expiry moment and also treats any `401` response as a signal to log out.
- Auth routes are rate-limited to reduce brute-force risk.
- `helmet` sets standard security headers; CORS is restricted to `CLIENT_URL`.
- All task routes are scoped to `req.user._id`, so users can only ever read/modify their own data.

---

## Screenshots

_Add screenshots of the Login, Register, Dashboard, Task List, Create/Edit Task, and Profile pages here before submission, e.g.:_

```
docs/screenshots/login.png
docs/screenshots/dashboard.png
docs/screenshots/tasks.png
docs/screenshots/create-task.png
docs/screenshots/profile.png
docs/screenshots/dark-mode.png
```

---

## Author's Notes for Submission

This repository satisfies the Week 1 Task requirements end-to-end: authentication (register/login/JWT/bcrypt), protected routes, full task CRUD, MongoDB with `Users` and `Tasks` collections, a responsive React UI with navigation/sidebar/dashboard/table/theme-toggle/loading/toasts/validation/error-handling, and 6 of the requested "at least five" additional features. See the [Project Structure](#project-structure) section for how it maps to the required layout.
