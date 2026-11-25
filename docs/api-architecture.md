# API-Side Architecture Documentation

This document outlines the architecture, module relationships, authentication/authorization lifecycle, layered design, and data layer of the **Library Management System API**.

---

## 1. High-Level Architecture Overview

The API is built using **NestJS**, a progressive TypeScript framework, adopting modular architecture, dependency injection, and clean separation of concerns. Persistence is managed via **Prisma ORM** connecting to **PostgreSQL**.

```mermaid
flowchart TD
    Client["Client App / HTTP Consumer"]

    subgraph NestJS ["NestJS Application Engine (Port 3000)"]
        Cors["CORS Middleware"]
        Throttle["ThrottlerGuard (Rate Limiting)"]
        Pipes["ValidationPipe (whitelist, forbidNonWhitelisted, transform)"]

        subgraph ModulesLayer ["Module Layer"]
            AppModule["AppModule (Root)"]
            AuthModule["AuthModule"]
            UsersModule["UsersModule"]
            BooksModule["BooksModule"]
            GenresModule["GenresModule"]
            PrismaModule["PrismaModule"]
        end

        subgraph CoreComponents ["Controllers, Guards & Services"]
            AuthController["AuthController"]
            BooksController["BooksController"]
            GenresController["GenresController"]

            JwtGuard["JwtAuthGuard (Passport JWT)"]
            RoleGuard["RolesGuard (@Roles Decorator)"]

            AuthService["AuthService"]
            UsersService["UsersService"]
            BooksService["BooksService"]
            GenresService["GenresService"]
            PrismaService["PrismaService (PrismaClient)"]
        end
    end

    subgraph DatabaseLayer ["Data Layer"]
        Postgres[(PostgreSQL Database)]
    end

    Client -->|HTTP Request| Cors
    Cors --> Throttle
    Throttle --> Pipes
    Pipes --> CoreComponents

    AppModule --> AuthModule
    AppModule --> UsersModule
    AppModule --> BooksModule
    AppModule --> GenresModule
    AppModule --> PrismaModule

    AuthController --> AuthService
    AuthService --> UsersService
    AuthService --> JwtGuard
    BooksController --> BooksService
    GenresController --> GenresService

    BooksController -.->|Guarded by| JwtGuard
    BooksController -.->|Guarded by| RoleGuard
    GenresController -.->|Guarded by| JwtGuard
    GenresController -.->|Guarded by| RoleGuard

    AuthService --> PrismaService
    UsersService --> PrismaService
    BooksService --> PrismaService
    GenresService --> PrismaService

    PrismaService -->|Prisma Engine / SQL| Postgres
```

---

## 2. NestJS Module Dependency Graph

```mermaid
graph LR
    AppModule --> ConfigModule["ConfigModule (Global)"]
    AppModule --> ThrottlerModule["ThrottlerModule (Rate Limiting)"]
    AppModule --> PrismaModule
    AppModule --> UsersModule
    AppModule --> AuthModule
    AppModule --> GenresModule
    AppModule --> BooksModule

    AuthModule --> UsersModule
    AuthModule --> JwtModule["JwtModule (@nestjs/jwt)"]
    AuthModule --> PassportModule["PassportModule"]

    UsersModule --> PrismaModule
    BooksModule --> PrismaModule
    GenresModule --> PrismaModule
```

---

## 3. Request-Response Pipeline

Every incoming HTTP request traverses an ordered pipeline before execution reaches domain services:

```mermaid
flowchart TD
    Req([HTTP Request]) --> CORS[CORS Handler]
    CORS --> Throttler[ThrottlerGuard: Check Rate Limits]
    Throttler --> Router[Nest Router: Resolve Route Handler]
    Router --> ValPipe[Global ValidationPipe: Validate & Strip DTOs]
    ValPipe --> ParamPipe[Param Pipes: e.g., ParseUUIDPipe]
    ParamPipe --> AuthGuard{Route has JwtAuthGuard?}

    AuthGuard -->|Yes| ExtractJWT[Extract Bearer Token & Validate Signature]
    AuthGuard -->|No| RolesCheck
    ExtractJWT -->|Valid| AttachUser[Attach user payload to request.user]
    ExtractJWT -->|Invalid/Expired| Throw401[Throw 401 Unauthorized]

    AttachUser --> RolesCheck{Route has RolesGuard?}
    RolesCheck -->|Yes| VerifyRole{user.role in @Roles?}
    RolesCheck -->|No| Controller[Execute Controller Handler]
    VerifyRole -->|Matched| Controller
    VerifyRole -->|Not Matched| Throw403[Throw 403 Forbidden]

    Controller --> Service[Execute Service Business Logic]
    Service --> Prisma[Execute Prisma Query]
    Prisma --> DB[(PostgreSQL)]
    DB --> Prisma
    Prisma --> Service
    Service --> Controller
    Controller --> Res([HTTP Response])
```

---

## 4. Authentication & Authorization Architecture

### 4.1 Token Issuance and Verification

- **Passwords**: Salted and hashed using `bcrypt`.
- **JWT**: Signed using `@nestjs/jwt` with a secret and expiry configured via `.env`.
- **RBAC**: Supports roles `MEMBER` and `LIBRARIAN`.
- **Protected Actions**: Administrative operations (Creating, updating, and deleting books or genres) strictly require `LIBRARIAN` role.

```mermaid
sequenceDiagram
    autonumber
    actor Client
    participant AuthCtrl as AuthController
    participant AuthSvc as AuthService
    participant UserSvc as UsersService
    participant Prisma as PrismaService
    participant JWT as JwtService

    %% Login Sequence
    Client->>AuthCtrl: POST /auth/login { email, password }
    AuthCtrl->>AuthSvc: login(dto)
    AuthSvc->>UserSvc: findByEmail(email)
    UserSvc->>Prisma: user.findUnique({ where: { email } })
    Prisma-->>UserSvc: User Record with passwordHash
    AuthSvc->>AuthSvc: bcrypt.compare(password, passwordHash)
    alt Invalid Credentials
        AuthSvc-->>Client: 401 Unauthorized
    else Valid Credentials
        AuthSvc->>JWT: sign({ sub: user.id, email: user.email, role: user.role })
        JWT-->>AuthSvc: accessToken
        AuthSvc-->>Client: { accessToken, user: { id, email, name, role } }
    end

    %% Protected Resource Request
    Client->>BooksCtrl: POST /books (Header: Bearer accessToken)
    Note over BooksCtrl: Guarded by JwtAuthGuard & RolesGuard ('LIBRARIAN')
    alt Role is MEMBER
        BooksCtrl-->>Client: 403 Forbidden
    else Role is LIBRARIAN
        BooksCtrl->>BooksSvc: create(createBookDto)
        BooksSvc->>Prisma: book.create(...)
        Prisma-->>BooksSvc: Created Book
        BooksSvc-->>Client: 201 Created (Book)
    end
```

---

## 5. Database Schema & Entity Relationships

The schema is defined using Prisma schema specification connecting to PostgreSQL:

```mermaid
erDiagram
    User ||--o{ Review : "writes"
    Book ||--o{ Review : "receives"
    Genre ||--o{ Book : "contains"

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

## 6. Endpoints Summary

| Method | Endpoint | Access | Guards | Description |
|---|---|---|---|---|
| `POST` | `/auth/register` | Public | Rate Limiter (10 req/min) | Registers a new member account |
| `POST` | `/auth/login` | Public | Rate Limiter (5 req/min) | Authenticates credentials and returns JWT |
| `GET` | `/auth/me` | Authenticated | `JwtAuthGuard` | Retrieves current authenticated profile |
| `GET` | `/books` | Public | None | Lists books with pagination (`page`, `limit`), search (`q`), and filter (`genreId`) |
| `GET` | `/books/:id` | Public | `ParseUUIDPipe` | Retrieves specific book with its genre relation |
| `POST` | `/books` | Librarian | `JwtAuthGuard`, `RolesGuard` (`LIBRARIAN`) | Creates a new book |
| `PATCH` | `/books/:id` | Librarian | `JwtAuthGuard`, `RolesGuard` (`LIBRARIAN`) | Updates existing book details |
| `DELETE` | `/books/:id` | Librarian | `JwtAuthGuard`, `RolesGuard` (`LIBRARIAN`) | Removes book from library |
| `GET` | `/genres` | Public | None | Lists all genres |
| `GET` | `/genres/:id` | Public | `ParseUUIDPipe` | Retrieves specific genre |
| `POST` | `/genres` | Librarian | `JwtAuthGuard`, `RolesGuard` (`LIBRARIAN`) | Creates a new genre |
| `PATCH` | `/genres/:id` | Librarian | `JwtAuthGuard`, `RolesGuard` (`LIBRARIAN`) | Updates an existing genre |
| `DELETE` | `/genres/:id` | Librarian | `JwtAuthGuard`, `RolesGuard` (`LIBRARIAN`) | Deletes a genre |
