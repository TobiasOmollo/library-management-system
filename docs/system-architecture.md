# System-Wide Architecture Documentation

This document provides a holistic end-to-end architecture view of the **Library Management System**, connecting the client-side SPA with the server-side NestJS REST API and PostgreSQL database.

---

## 1. Full-Stack System Diagram

```mermaid
flowchart TD
    subgraph Browser ["Client Tier (Browser)"]
        UI["React 19 SPA (Vite)"]
        Router["React Router DOM"]
        State["Component State & AbortController"]
    end

    subgraph API_Gateway ["API Tier (NestJS / Node.js)"]
        CORS["CORS Protection"]
        RateLimit["Rate Limiting (ThrottlerGuard)"]
        ValPipe["ValidationPipe (class-validator)"]

        subgraph CoreControllers ["Controllers"]
            AuthCtrl["AuthController (/auth)"]
            BooksCtrl["BooksController (/books)"]
            GenresCtrl["GenresController (/genres)"]
        end

        subgraph Security ["Security & Auth Layer"]
            JWT["Passport JWT Strategy"]
            Roles["Roles Guard (LIBRARIAN / MEMBER)"]
        end

        subgraph CoreServices ["Business Services"]
            AuthSvc["AuthService"]
            UsersSvc["UsersService"]
            BooksSvc["BooksService"]
            GenresSvc["GenresService"]
        end

        subgraph DataAccess ["ORM Layer"]
            PrismaSvc["PrismaService (Prisma Client)"]
        end
    end

    subgraph DatabaseTier ["Database Tier"]
        Postgres[(PostgreSQL Database)]
    end

    UI --> Router
    Router --> State
    State -->|HTTP JSON Requests via Fetch| CORS
    CORS --> RateLimit
    RateLimit --> ValPipe
    ValPipe --> CoreControllers

    CoreControllers --> Security
    Security --> CoreServices
    CoreServices --> PrismaSvc
    PrismaSvc -->|SQL Queries| Postgres
```

---

## 2. Architecture Documentation Index

- [Client-Side Architecture Documentation](file:///c:/Users/HomePC/Documents/PLP/MEARN/Week1/library%20management%20system/docs/client-architecture.md)
- [API-Side Architecture Documentation](file:///c:/Users/HomePC/Documents/PLP/MEARN/Week1/library%20management%20system/docs/api-architecture.md)
