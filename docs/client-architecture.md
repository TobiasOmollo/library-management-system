# Client-Side Architecture Documentation

This document outlines the architecture, component hierarchy, state lifecycle, routing, and data flow of the **Folio** Client application.

---

## 1. High-Level Overview

The client is a single-page application (SPA) built with **React 19**, **Vite**, and **React Router DOM v7**. It communicates over HTTP/REST with the NestJS backend API.

```mermaid
flowchart TD
    User([User Browser])
    ViteServer["Vite Dev / Static Bundle (HTML, CSS, JS)"]
    ReactApp["React 19 Application (index.html / main.jsx)"]
    Router["React Router (BrowserRouter)"]
    AppLayout["AppLayout Shell"]
    Header["SiteHeader Component"]
    Catalog["CatalogPage (Route: /)"]
    Detail["BookDetailPage (Route: /books/:id)"]
    Footer["SiteFooter Component"]
    BackendAPI["NestJS Backend API (http://localhost:3000)"]

    User -->|Visits Webpage| ViteServer
    ViteServer --> ReactApp
    ReactApp --> Router
    Router --> AppLayout
    AppLayout --> Header
    AppLayout --> Catalog
    AppLayout --> Detail
    AppLayout --> Footer
    Catalog -->|HTTP GET /genres, /books| BackendAPI
    Detail -->|HTTP GET /books/:id| BackendAPI
```

---

## 2. Component Hierarchy & Structure

```mermaid
graph TD
    App["App (BrowserRouter)"]
    AppLayout["AppLayout (Shell)"]
    SiteHeader["SiteHeader (Navbar & Brand)"]
    Routes["Routes (Switch)"]
    CatalogPage["CatalogPage (Home / Collection)"]
    BookDetailPage["BookDetailPage (/books/:id)"]
    NotFound["404 Not Found Page"]
    SiteFooter["SiteFooter (Branding & Links)"]

    App --> AppLayout
    AppLayout --> SiteHeader
    AppLayout --> Routes
    AppLayout --> SiteFooter

    Routes -->|Path: /| CatalogPage
    Routes -->|Path: /books/:id| BookDetailPage
    Routes -->|Path: *| NotFound

    CatalogPage --> HeroSection["Hero Section"]
    CatalogPage --> CatalogControls["Catalog Controls (Search + Genre Filter)"]
    CatalogPage --> BookGrid["Book Grid"]
    CatalogPage --> PaginationNav["Pagination Nav"]
    BookGrid --> BookCard1["BookCard"]
    BookGrid --> BookCardN["BookCard ..."]
    BookCard1 --> BookMark["BookMark (SVG/CSS Cover Art)"]

    BookDetailPage --> DetailLayout["Detail Layout (Cover Art + Meta)"]
    DetailLayout --> BookMarkLarge["BookMark (large=true)"]
```

---

## 3. Data Flow & State Management

The client utilizes React hooks (`useState`, `useEffect`) and standard web APIs (`fetch`, `AbortController`, `URLSearchParams`) for predictable, race-condition-free data fetching.

### 3.1 Catalog Page Flow

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Catalog as CatalogPage
    participant Debounce as Debounce Timer (350ms)
    participant Fetch as fetchApi / Fetch API
    participant API as NestJS Backend

    User->>Catalog: Mounts Page
    Catalog->>Fetch: fetchApi('/genres')
    Fetch->>API: GET /genres
    API-->>Catalog: Return genres list

    Catalog->>Fetch: fetchApi('/books?page=1&limit=12')
    Fetch->>API: GET /books?page=1&limit=12
    API-->>Catalog: Return { data: Book[], total: number }
    Catalog-->>User: Render Book Cards & Genre Chips

    User->>Catalog: Types search keyword
    Catalog->>Debounce: Set timer (350ms)
    Note over Debounce: User pauses typing
    Debounce->>Catalog: Update debouncedSearch state
    Catalog->>Fetch: fetchApi('/books?page=1&limit=12&q=...')
    Fetch->>API: GET /books?page=1&limit=12&q=...
    API-->>Catalog: Filtered results
    Catalog-->>User: Update Grid UI
```

### 3.2 Request Lifecycle & Race Condition Guarding

To eliminate stale response overwrites during rapid user filtering, `CatalogPage` tracks a composite request key:

```mermaid
flowchart LR
    StateInputs["Inputs: [debouncedSearch, selectedGenre, page, retry]"] --> Key["requestKey = JSON.stringify(...)"]
    Key --> Trigger["useEffect Triggers"]
    Trigger --> AbortPrevious["controller.abort() on cleanup"]
    Trigger --> ApiCall["fetchApi('/books?...')"]
    ApiCall --> Receive["setCatalogResult({ key, books, total })"]
    Receive --> RenderCheck{"catalogResult.key === requestKey ?"}
    RenderCheck -->|Yes| DisplayList["Display Books & Pagination"]
    RenderCheck -->|No| DisplayLoader["Display Loading Skeleton"]
```

---

## 4. Key Client Subsystems

| Module | Purpose | Location |
|---|---|---|
| **Entry Point** | Mounts React root into `#root` DOM container | `src/main.jsx` |
| **Router & Root** | Provides `BrowserRouter` and high-level routing | `src/App.jsx` |
| **Catalog View** | Search, genre filtering, pagination, and book listing | `CatalogPage` in `src/App.jsx` |
| **Detail View** | Detailed metadata, availability status, ISBN, description | `BookDetailPage` in `src/App.jsx` |
| **Decorative Cover Art** | Dynamic procedural book cover generator | `BookMark` in `src/App.jsx` |
| **Networking** | Promise-based fetch wrapper with error handling | `fetchApi()` in `src/App.jsx` |
| **Design & Theme** | Typography, CSS custom properties, grid layouts | `src/App.css`, `src/index.css` |

---

## 5. Technology Stack

- **Framework**: React 19 (`react`, `react-dom`)
- **Routing**: React Router DOM v7 (`react-router-dom`)
- **Build Tool**: Vite 8 (`@vitejs/plugin-react`)
- **CSS Architecture**: Vanilla Modern CSS (CSS Grid, Flexbox, CSS Custom Variables, Container Queries)
