# API-Side Architecture

> Note: Also available in the project-wide documentation at [docs/api-architecture.md](file:///c:/Users/HomePC/Documents/PLP/MEARN/Week1/library%20management%20system/docs/api-architecture.md).

---

## 1. High-Level Modular Architecture

```mermaid
flowchart TD
    Client["Client App / HTTP Consumer"]

    subgraph NestJS ["NestJS Application Engine (Port 3000)"]
        Cors["CORS Middleware"]
        Throttle["ThrottlerGuard (Rate Limiting)"]
        Pipes["ValidationPipe (whitelist, forbidNonWhitelisted, transform)"]

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

    Client --> Cors
    Cors --> Throttle
    Throttle --> Pipes
    Pipes --> CoreComponents

    AuthController --> AuthService
    AuthService --> UsersService
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

## 2. Request & Security Pipeline

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
```

---

## 3. Data Models & Entity Relations

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
