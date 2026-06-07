# Company CRUD

A full-stack user and role management application built as an npm monorepo. The backend is a REST API built with NestJS, and the frontend is a Next.js dashboard with Ant Design.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15, React 19, Ant Design 5, Tailwind CSS 4 |
| Backend | NestJS 11, TypeORM, Passport JWT |
| Database | PostgreSQL 16 |
| Auth | JWT (stored as HttpOnly cookie) |
| Package Manager | npm workspaces |
| Containerization | Docker Compose |

---

## Project Structure

```
company-crud/
├── apps/
│   ├── server/          # NestJS backend (port 4001)
│   └── web/             # Next.js frontend (port 3000)
├── docker-compose.yml   # PostgreSQL container
└── package.json         # Root workspace config
```

---

## Prerequisites

- Node.js 18+
- npm 9+
- Docker & Docker Compose

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Hasi6558/company-crud.git
cd company-crud
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the database

```bash
docker compose up -d
```

This spins up a PostgreSQL 16 container with the following defaults:

| Setting | Value |
|---|---|
| Host | `localhost` |
| Port | `5432` |
| User | `app` |
| Password | `app` |
| Database | `appdb` |

### 4. Configure the server environment

Create a `.env` file inside `apps/server/`:

```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=app
DATABASE_PASSWORD=app
DATABASE_NAME=appdb

JWT_SECRET=your_secret_here

SERVER_PORT=4001
```

> The schema is auto-synced via TypeORM's `synchronize: true` — no migrations needed in development.

### 5. Start the backend

```bash
npm run dev:server
```

The API will be available at `http://localhost:4001`.

### 6. Start the frontend

```bash
npm run dev:web
```

The app will be available at `http://localhost:3000`.

---

## API Reference

### Auth

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/auth/login` | Log in and receive a session cookie | No |
| `POST` | `/auth/logout` | Clear the session cookie | No |
| `GET` | `/auth/me` | Get the currently authenticated user | Yes |

**Login request body:**
```json
{
  "email": "user@example.com",
  "password": "password"
}
```

---

### Users

All user endpoints require a valid JWT cookie and the appropriate permission.

| Method | Endpoint | Permission | Description |
|---|---|---|---|
| `GET` | `/users` | `read:users` | List all users |
| `GET` | `/users/:id` | `read:user` | Get a user by ID |
| `GET` | `/users/email/:email` | `read:user` | Get a user by email |
| `POST` | `/users` | `create:users` | Create a new user |
| `DELETE` | `/users/:id` | `delete:users` | Delete a user |

**Create user request body:**
```json
{
  "email": "user@example.com",
  "fullName": "Jane Doe",
  "roleId": "<uuid>"
}
```

---

### Roles

| Method | Endpoint | Permission | Description |
|---|---|---|---|
| `GET` | `/roles` | Authenticated | List all roles |
| `GET` | `/roles/:id` | Public | Get a role by ID |
| `POST` | `/roles` | `create:roles` | Create a new role |
| `PATCH` | `/roles/:id` | `update:roles` | Update a role |
| `DELETE` | `/roles/:id` | `delete:roles` | Delete a role |

**Create/update role request body:**
```json
{
  "name": "manager",
  "description": "Can manage users",
  "permissions": ["read:users", "create:users", "delete:users"]
}
```

---

## Permissions

Permissions are stored on the `Role` entity and enforced via a custom `PermissionGuard`. Available permissions:

| Permission | Scope |
|---|---|
| `read:users` | View all users |
| `read:user` | View own profile |
| `create:users` | Create users |
| `update:users` | Update users |
| `delete:users` | Delete users |
| `read:roles` | View roles |
| `create:roles` | Create roles |
| `update:roles` | Update roles |
| `delete:roles` | Delete roles |
| `admin:all` | Full access |
| `admin:edit` | Edit-level admin access |

---

## Authentication Flow

1. Client sends `POST /auth/login` with email and password.
2. Server validates credentials, signs a JWT, and sets it as an `HttpOnly` cookie (`token`).
3. All subsequent requests automatically include the cookie.
4. The `AuthGuard` extracts and verifies the JWT from the cookie on protected routes.
5. Client sends `POST /auth/logout` to clear the cookie.

---

## Available Scripts

Run from the **root** of the monorepo:

```bash
# Start backend in watch mode
npm run dev:server

# Start frontend in dev mode (Turbopack)
npm run dev:web

# Format all code with Prettier
npm run format

# Lint all workspaces
npm run lint
```

Run from **`apps/server`**:

```bash
npm run build          # Build for production
npm run start:prod     # Run production build
npm run test           # Unit tests
npm run test:e2e       # End-to-end tests
npm run test:cov       # Test coverage report
```

---

## Docker

The `docker-compose.yml` only manages the database. To bring it up or down:

```bash
# Start
docker compose up -d

# Stop
docker compose down

# Stop and remove data volume
docker compose down -v
```

---

## License

This project is unlicensed and intended for educational/portfolio purposes.
