# Chronicle — A Full-Stack Blogging & Content Platform

A production-style, role-based blogging platform built for the ITSimplera Full Stack Web Development Internship — **Week 3 Task**. Registered **authors** write, edit, and manage their own posts; **readers** browse, search, comment, like, and bookmark published content.

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
9. [Deliverables Checklist](#deliverables-checklist)

---

## Features

### Roles & Authentication
- Two roles: **Author** (create/manage own posts) and **Reader** (browse, comment, bookmark)
- Register, login, and **real server-side logout** (JWT blacklisting — a logged-out token is rejected immediately, not just after it expires)
- Password hashing with bcrypt.js (10 salt rounds); passwords are never returned by the API
- Protected + role-gated routes (`protect` + `authorize('author')` middleware)
- Profile view/update, **profile picture upload** (Multer), and password change

### Posts
- Full CRUD for posts: title, rich-text content, cover image, category, tags, status (draft/published)
- Only the post's author can edit or delete it, and only they can see their own drafts
- Public feed shows published posts only
- Auto-generated, unique, URL-safe **slugs** for clean post URLs
- Rich text content is **sanitized server-side** (`sanitize-html`) before storage to prevent XSS

### Comments
- Full CRUD for comments, with **threaded replies** (`parentComment` self-reference, rendered as a nested tree)
- Only a comment's author can edit or delete it; deleting a comment cascades to its replies
- Comment text is sanitized to plain text server-side

### Advanced Features (10 of the requested 5+ implemented)
- ✅ Search posts by title/content (MongoDB text index)
- ✅ Filter by category or tag
- ✅ Pagination
- ✅ Sorting (newest, oldest, most viewed, most liked)
- ✅ Like / bookmark system (toggle endpoints, `Bookmark` collection)
- ✅ Rich text editor for post content (custom toolbar, sanitized on save)
- ✅ Comment threading (replies to comments)
- ✅ Reading-time estimate (computed virtual, ~200 wpm)
- ✅ View-count tracking per post (excludes the author's own views)
- ✅ Author dashboard statistics (total posts, views, likes, comments)

### Frontend (React)
- Pages: Home/Feed, Post Detail, Create/Edit Post, Login, Register, Profile, My Posts (author dashboard), Bookmarks
- Client-side routing with React Router, incl. protected and author-only routes
- Global auth state via Context API; JWT attached to every request via an Axios interceptor
- Form validation with inline error messages on all forms
- Responsive design (mobile / tablet / desktop) with Tailwind CSS
- Loading, empty, and error states handled gracefully across all data-driven views

---

## Project Structure

```
Chronicle/
├── client/                      # React frontend (Vite)
│   ├── src/
│   │   ├── components/           # Navbar, PostCard, RichTextEditor, CommentThread, etc.
│   │   ├── pages/                 # Route-level pages
│   │   ├── context/                # AuthContext
│   │   ├── services/                # Axios API layer
│   │   └── utils/                  # validators, media URL helper
│   ├── tailwind.config.js
│   └── package.json
│
├── server/                      # Express backend
│   ├── controllers/              # Route handler logic
│   ├── models/                   # Mongoose schemas (User, Post, Comment, Bookmark, TokenBlacklist)
│   ├── routes/                   # Express routers
│   ├── middleware/               # auth, role-based authorize, upload (Multer), validation, error handling
│   ├── config/                   # MongoDB connection
│   ├── utils/                    # ApiError, generateToken, HTML sanitizer
│   ├── uploads/                  # Uploaded avatars & cover images (served statically)
│   └── server.js
│
├── docs/                        # Postman collection + ER diagram
│   ├── Chronicle-API.postman_collection.json
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
| Icons          | lucide-react                         |
| Notifications  | react-toastify                       |
| Backend        | Node.js, Express.js                  |
| Database       | MongoDB + Mongoose                   |
| Auth           | JSON Web Token (jsonwebtoken), bcrypt.js |
| File Uploads   | Multer                               |
| Sanitization   | sanitize-html                        |
| Validation     | express-validator                    |
| Security       | helmet, cors, express-rate-limit     |

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org) v18+
- [MongoDB Community Server](https://www.mongodb.com/try/download/community) running locally, or a MongoDB Atlas connection string
- npm

### 1. Install dependencies

```bash
cd Chronicle
npm run install:all
npm install       # installs the root 'concurrently' dependency
```

### 2. Configure environment variables

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

Edit `server/.env` and set a strong `JWT_SECRET` and your `MONGO_URI`.

### 3. Run in development

```bash
npm run dev
```

- API runs at `http://localhost:5000`
- Client runs at `http://localhost:5173`
- Uploaded images are served from `http://localhost:5000/uploads/...`

### 4. Build for production

```bash
npm run build      # builds the React client into client/dist
npm start           # starts the Express server
```

---

## Environment Variables

**server/.env**

| Variable            | Description                                  | Example                                |
|----------------------|-----------------------------------------------|------------------------------------------|
| `PORT`               | Port the API listens on                      | `5000`                                    |
| `NODE_ENV`           | `development` or `production`                | `development`                             |
| `MONGO_URI`          | MongoDB connection string                    | `mongodb://127.0.0.1:27017/chronicle-db`  |
| `JWT_SECRET`         | Secret used to sign JWTs                     | `long-random-string`                      |
| `JWT_EXPIRES_IN`     | Token lifetime                               | `1h`                                      |
| `CLIENT_URL`         | Allowed CORS origin                          | `http://localhost:5173`                   |
| `MAX_UPLOAD_SIZE_MB` | Max avatar / cover image size                | `5`                                        |

**client/.env**

| Variable            | Description                       | Example                        |
|----------------------|-------------------------------------|-----------------------------------|
| `VITE_API_URL`       | Base URL of the API                | `http://localhost:5000/api`      |
| `VITE_UPLOADS_URL`   | Base URL for serving uploaded images | `http://localhost:5000`        |

---

## API Reference

Base URL: `/api`. All private routes require `Authorization: Bearer <token>`.

### Auth — `/api/auth`

| Method | Endpoint     | Access  | Description                                        |
|--------|--------------|---------|-------------------------------------------------------|
| POST   | `/register`  | Public  | Create a new account (`role`: `author` or `reader`)     |
| POST   | `/login`     | Public  | Log in and receive a JWT                                |
| POST   | `/logout`    | Private | Invalidate the current JWT immediately (blacklisted)     |
| GET    | `/me`        | Private | Get the current user                                     |

### Users — `/api/users`

| Method | Endpoint            | Access  | Description                                    |
|--------|----------------------|---------|---------------------------------------------------|
| GET    | `/profile`           | Private | Get name / email / bio / role                       |
| PUT    | `/profile`           | Private | Update name / bio                                    |
| PUT    | `/profile/avatar`    | Private | Upload / replace profile picture (multipart)         |
| PUT    | `/change-password`   | Private | Change password                                       |
| GET    | `/dashboard-stats`   | Private | Author-only: total posts, views, likes, comments       |
| GET    | `/bookmarks`         | Private | List the current user's bookmarked posts                |

### Posts — `/api/posts`

| Method | Endpoint              | Access            | Description                                                                 |
|--------|------------------------|-------------------|----------------------------------------------------------------------------|
| GET    | `/`                    | Public             | Published posts — `?search=&category=&tag=&sort=&page=&limit=`               |
| POST   | `/`                    | Private (author)   | Create a post (draft or published)                                           |
| GET    | `/mine`                | Private (author)   | The logged-in author's own posts, including drafts                            |
| GET    | `/:id`                 | Public\*           | Get a post by id or slug. \*Drafts are only visible to their author            |
| PUT    | `/:id`                 | Private (owner)    | Update a post                                                                  |
| PUT    | `/:id/cover-image`     | Private (owner)    | Upload / replace a post's cover image (multipart)                             |
| DELETE | `/:id`                 | Private (owner)    | Delete a post                                                                   |
| POST   | `/:id/like`            | Private            | Toggle like on a post                                                          |
| POST   | `/:id/bookmark`        | Private            | Toggle bookmark on a post                                                      |
| GET    | `/:id/comments`        | Public             | Get a post's comments, threaded into replies                                    |
| POST   | `/:id/comments`        | Private            | Add a comment (or a reply, via `parentComment`)                                 |

`sort` accepts `newest`, `oldest`, `mostViewed`, `mostLiked`.

### Comments — `/api/comments`

| Method | Endpoint | Access             | Description                                          |
|--------|----------|--------------------|---------------------------------------------------------|
| PUT    | `/:id`   | Private (owner)    | Update a comment                                          |
| DELETE | `/:id`   | Private (owner)    | Delete a comment (cascades to its replies)                  |

A ready-to-import **Postman collection** covering every endpoint above is at [`docs/Chronicle-API.postman_collection.json`](docs/Chronicle-API.postman_collection.json).

**Example — Create a Post**
```http
POST /api/posts
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Getting Started with the MERN Stack",
  "content": "<p>This is my <strong>first</strong> post.</p>",
  "category": "Engineering",
  "tags": ["mern", "javascript"],
  "status": "published"
}
```

**Example — Reply to a Comment (threading)**
```http
POST /api/posts/<postId>/comments
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Totally agree!",
  "parentComment": "<commentId>"
}
```

---

## Database Schema

> Full entity-relationship diagram: [`docs/er-diagram.png`](docs/er-diagram.png) (source: [`docs/er-diagram.mmd`](docs/er-diagram.mmd))

**User** — `_id, name, email, password (hashed), role (author|reader), bio, profilePicUrl, avatarColor, lastLogin, createdAt, updatedAt`

**Post** — `_id, title, slug, content, coverImageUrl, category, tags[], status (draft|published), author (ref User), viewCount, likedBy[] (ref User), createdAt, updatedAt`
> `likeCount` and `readingTimeMinutes` are computed virtuals, not stored fields.

**Comment** — `_id, content, post (ref Post), user (ref User), parentComment (ref Comment, optional), createdAt, updatedAt`

**Bookmark** — `_id, user (ref User), post (ref Post), createdAt` — unique compound index on `(user, post)`

**TokenBlacklist** — `_id, token (unique), expiresAt` — TTL index auto-removes expired entries

---

## Security Notes

- Passwords are hashed with bcrypt.js (10 salt rounds) and never returned by the API.
- **Logout is enforced server-side.** `POST /api/auth/logout` stores the current token in `tokenblacklists`; the `protect` middleware rejects it on every subsequent request, even before its JWT `exp` is reached. A TTL index cleans up each entry automatically.
- **Rich text and comments are sanitized server-side** (`sanitize-html`) before being stored — a restricted tag allowlist for post content, plain-text-only for comments — to prevent stored XSS.
- Role-based access is enforced server-side (`authorize('author')`), not just hidden in the UI — a reader who calls `POST /api/posts` directly still gets a `403`.
- Ownership is checked on every mutating post/comment route — an author can only edit/delete their own posts, and only a comment's author can edit/delete it.
- File uploads are restricted by MIME type and size (`multer` + a `fileFilter`), and stored under a random filename to avoid path/name collisions.
- CORS is restricted to `CLIENT_URL`; `helmet` sets standard security headers; auth routes are rate-limited.
- All secrets live in `.env`, which is git-ignored.

---

## Deliverables Checklist

| Deliverable | Status | Location |
|-------------|--------|----------|
| Public GitHub Repository | ⚠️ Push it yourself | — |
| Complete Source Code (frontend + backend) | ✅ | `client/`, `server/` |
| README.md | ✅ | this file |
| Postman Collection | ✅ | [`docs/Chronicle-API.postman_collection.json`](docs/Chronicle-API.postman_collection.json) |
| Database Schema / ER Diagram | ✅ | [`docs/er-diagram.png`](docs/er-diagram.png) |
| 5-Minute Demonstration Video | ⚠️ Record it yourself | — |

---

