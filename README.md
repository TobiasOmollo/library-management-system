# Folio — Library Management System

A full-stack modern library and book catalogue application featuring a **NestJS** REST API with **Prisma ORM** & **PostgreSQL** on the backend, and a high-performance **React 19** + **Vite** single-page application on the frontend.

---

## Table of Contents

- [Overview](#overview)
- [System Architecture](#system-architecture)
- [Tech Stack](#tech-stack)
- [Repository Structure](#repository-structure)
- [Prerequisites](#prerequisites)
- [Quick Start Guide](#quick-start-guide)
  - [1. Backend Setup (API)](#1-backend-setup-api)
  - [2. Database Migration & Seeding](#2-database-migration--seeding)
  - [3. Frontend Setup (Client)](#3-frontend-setup-client)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Database Schema](#database-schema)
- [Scripts & Commands](#scripts--commands)
- [Architecture & Design Documentation](#architecture--design-documentation)
- [Security Highlights](#security-highlights)
- [License](#license)

---

## Overview

**Folio** is designed to streamline book discovery, circulation, and library management:
- **Members (Patrons)** can browse the collection, search books by title/author with debounced instant search, filter by genres, view individual book details, and check borrowing availability.
- **Librarians** have administrative privileges secured with Role-Based Access Control (RBAC) to manage catalog inventory (create, update, and delete books and genres).

---

## System Architecture

```mermaid
flowchart LR
    Browser["User Browser\n(React 19 + Vite SPA)"]
    API["NestJS Backend API\n(Port 3000 / PORT)"]
    DB[(PostgreSQL Database\nNeon / Cloud)]

    Browser -->|HTTP REST JSON\nCORS Enabled| API
    API -->|Prisma ORM Client\nType-safe SQL| DB
```

For comprehensive architectural breakdowns and flow diagrams:
- [Client Architecture Documentation](file:///c:/Users/HomePC/Documents/PLP/MEARN/Week1/library%20management%20system/docs/client-architecture.md)
- [API Architecture Documentation](file:///c:/Users/HomePC/Documents/PLP/MEARN/Week1/library%20management%20system/docs/api-architecture.md)
- [System Architecture Overview](file:///c:/Users/HomePC/Documents/PLP/MEARN/Week1/library%20management%20system/docs/system-architecture.md)

---

## Tech Stack

### Backend (`/api`)
- **Framework**: [NestJS 12](https://nestjs.com/) (Node.js & TypeScript)
- **Database & ORM**: [PostgreSQL](https://www.postgresql.org/) managed with [Prisma 6](https://www.prisma.io/)
- **Authentication**: Passport.js (`passport-jwt`), `@nestjs/jwt`, `bcrypt`
- **Validation**: `class-validator`, `class-transformer` (global `ValidationPipe` with whitelist enforcement)
- **Security & Throttling**: `@nestjs/throttler` (tiered rate limiting)
- **Seed Runner**: `tsx`

### Frontend (`/client`)
- **Library**: [React 19](https://react.dev/)
- **Build Tool**: [Vite 8](https://vitejs.dev/) with Fast Refresh
- **Routing**: [React Router DOM v7](https://reactrouter.com/)
- **Styling**: Modern CSS3 (CSS Grid, Flexbox, CSS Custom Properties, and responsive containers)
- **Procedural Graphics**: Dynamic procedural book cover generator (`BookMark`)

---

## Repository Structure

```
library-management-system/
├── README.md                      # Unified project README (this document)
├── LICENSE                        # MIT License
├── .gitignore                     # Git ignore rules
│
├── api/                           # NestJS Backend API
│   ├── prisma/
│   │   ├── schema.prisma          # Prisma schema definition
│   │   ├── migrations/            # SQL migration history
│   │   └── seed.ts                # Database seed script
│   ├── src/
│   │   ├── main.ts                # Application entrypoint & global pipes
│   │   ├── app.module.ts          # Root module & config validation
│   │   ├── auth/                  # JWT auth, Passport strategy, Roles guards
│   │   ├── books/                 # Books controller, service, DTOs
│   │   ├── genres/                # Genres controller, service, DTOs
│   │   ├── users/                 # Users service
│   │   └── prisma/                # Prisma service provider
│   ├── .env.example               # Backend environment template
│   ├── package.json
│   ├── tsconfig.json
│   └── test_api.ps1               # PowerShell smoke test suite
│
├── client/                        # React Frontend Single-Page App
│   ├── public/                    # Static assets & favicons
│   ├── src/
│   │   ├── assets/                # Images and vector icons
│   │   ├── App.jsx                # Main application & routing logic
│   │   ├── App.css                # Component and typography styling
│   │   ├── index.css              # Global baseline CSS
│   │   └── main.jsx               # React DOM entrypoint
│   ├── .env.example               # Frontend environment template
│   ├── package.json
│   └── vite.config.js
│
└── docs/                          # Architecture & Design Documents
    ├── client-architecture.md
    ├── api-architecture.md
    └── system-architecture.md
```

---

## Prerequisites

- **Node.js**: `v20.x` or newer (LTS recommended)
- **npm**: `v10.x` or newer
- **PostgreSQL**: A running PostgreSQL database (e.g. [Neon](https://neon.tech/), Supabase, or a local PostgreSQL server)

---

## Quick Start Guide

### 1. Backend Setup (API)

Open a terminal and navigate to the `api` directory:

```bash
cd api
npm install
```

Copy the environment template and configure your connection strings:

```bash
# On Linux/macOS
cp .env.example .env

# On Windows PowerShell
Copy-Item .env.example .env
```

Open `api/.env` and supply your database credentials and a secure secret:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/library_db?schema=public"
JWT_SECRET="your-secure-random-secret-at-least-32-chars"
```

> **Note on JWT_SECRET**: The API validates that `JWT_SECRET` is present and non-empty at startup. If missing, it will halt with a descriptive error. You can generate a random secret with:
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> ```

### 2. Database Migration & Seeding

From the `api` directory, apply the Prisma database migrations and seed default data:

```bash
# Generate the Prisma Client
npx prisma generate

# Apply migrations to PostgreSQL
npx prisma migrate dev

# Seed database with librarian account, default genres, and sample books
npx prisma db seed
```

Start the API development server:

```bash
npm run start:dev
```

The API will now be running at `http://localhost:3000`.

### 3. Frontend Setup (Client)

Open a second terminal window and navigate to the `client` directory:

```bash
cd client
npm install
```

(Optional) Create a `client/.env` file if your API runs on a custom port or origin:
```env
VITE_API_URL=http://localhost:3000
```

Start the Vite development server:

```bash
npm run dev
```

Open your browser at `http://localhost:5173` to explore the Folio library catalog.

---

## Environment Variables

### Backend (`api/.env`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `DATABASE_URL` | **Yes** | — | PostgreSQL connection string |
| `JWT_SECRET` | **Yes** | — | Secret string used for signing and verifying JSON Web Tokens |
| `JWT_EXPIRES_IN` | No | `1h` | JWT token expiration lifespan |
| `PORT` | No | `3000` | HTTP port for the NestJS server |
| `SEED_LIBRARIAN_EMAIL` | No | `librarian@example.com` | Email for the default librarian account |
| `SEED_LIBRARIAN_PASSWORD` | No | `Librarian123!` | Password for the default librarian account |

### Frontend (`client/.env`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `VITE_API_URL` | No | `http://localhost:3000` | Target base URL of the backend REST API |

---

## API Reference

All protected endpoints require an `Authorization: Bearer <token>` header.

### Authentication Endpoints

| Method | Endpoint | Access | Rate Limit | Description |
|---|---|---|---|---|
| `POST` | `/auth/register` | Public | 10 req / min | Register a new user (`MEMBER` role) |
| `POST` | `/auth/login` | Public | 5 req / min | Authenticate and receive a JWT access token |
| `GET` | `/auth/me` | Authenticated | 100 req / min | Fetch the authenticated user's profile |

### Books Endpoints

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/books` | Public | List books with search (`q`), filter (`genreId`), and pagination (`page`, `limit`) |
| `GET` | `/books/:id` | Public | Get single book details by UUID |
| `POST` | `/books` | Librarian | Create a new book |
| `PATCH` | `/books/:id` | Librarian | Update an existing book |
| `DELETE` | `/books/:id` | Librarian | Delete a book by UUID |

### Genres Endpoints

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/genres` | Public | List all genres |
| `GET` | `/genres/:id` | Public | Get single genre by UUID |
| `POST` | `/genres` | Librarian | Create a new genre |
| `PATCH` | `/genres/:id` | Librarian | Update a genre name |
| `DELETE` | `/genres/:id` | Librarian | Delete a genre (restricted if books are linked) |

---

## Database Schema

The database model is managed via Prisma in [api/prisma/schema.prisma](file:///c:/Users/HomePC/Documents/PLP/MEARN/Week1/library%20management%20system/api/prisma/schema.prisma):

```mermaid
erDiagram
    User ||--o{ Review : "writes"
    Book ||--o{ Review : "receives"
    Genre ||--o{ Book : "categorizes"

    User {
        String id PK "UUID"
        String email UK
        String passwordHash
        String name
        Role role "MEMBER | LIBRARIAN"
        DateTime createdAt
        DateTime updatedAt
    }

    Genre {
        String id PK "UUID"
        String name UK
        DateTime createdAt
        DateTime updatedAt
    }

    Book {
        String id PK "UUID"
        String title
        String author
        String isbn UK
        String description
        Int publishedYear
        Int copies
        Int available
        String genreId FK
        DateTime createdAt
        DateTime updatedAt
    }

    Review {
        String id PK "UUID"
        Int rating "1-5"
        String comment
        String bookId FK
        String userId FK
        DateTime createdAt
        DateTime updatedAt
    }
```

---

## Scripts & Commands

### Backend (`api/`)

```bash
npm run start:dev       # Start API in watch mode
npm run build           # Compile TypeScript to dist/
npm run start:prod      # Run production build (node dist/main)
npx prisma studio       # Open graphical database browser
npx prisma migrate dev  # Run pending database migrations
npx prisma db seed      # Re-run database seeding
```

### Frontend (`client/`)

```bash
npm run dev             # Start Vite development server
npm run build           # Build optimized production bundle
npm run preview         # Preview production build locally
npm run lint            # Run ESLint validation
```

---

## Architecture & Design Documentation

Detailed technical architecture documents with sequence diagrams, component trees, and data flows are available in the [`docs/`](file:///c:/Users/HomePC/Documents/PLP/MEARN/Week1/library%20management%20system/docs) directory:

- [Client-Side Architecture](file:///c:/Users/HomePC/Documents/PLP/MEARN/Week1/library%20management%20system/docs/client-architecture.md): React component hierarchy, state machine, debounced search lifecycle, error recovery.
- [API-Side Architecture](file:///c:/Users/HomePC/Documents/PLP/MEARN/Week1/library%20management%20system/docs/api-architecture.md): NestJS modular design, request-response pipeline, Guards, DTO validation, and data relationships.
- [Full-Stack System Architecture](file:///c:/Users/HomePC/Documents/PLP/MEARN/Week1/library%20management%20system/docs/system-architecture.md): Tiered architecture, security boundaries, and cross-cutting concerns.

---

## Security Highlights

1. **Strict Startup Secrets Validation**: `JWT_SECRET` is strictly verified during bootstrap—fallback secrets are forbidden, preventing misconfiguration vulnerabilities.
2. **Password Security**: Passwords are encrypted using `bcrypt` and excluded from serialization output.
3. **Role-Based Guards**: Modification endpoints enforce `JwtAuthGuard` and `RolesGuard` checking for the `LIBRARIAN` role.
4. **Input Sanitation & Coercion**: Global NestJS `ValidationPipe` with `whitelist: true` and `forbidNonWhitelisted: true` stops unknown attributes and payload manipulation.
5. **Rate Limiting**: Throttler limits brute force attempts on sensitive endpoints like `/auth/login` and `/auth/register`.

---

## License

This project is open-source software licensed under the [MIT License](file:///c:/Users/HomePC/Documents/PLP/MEARN/Week1/library%20management%20system/LICENSE).
