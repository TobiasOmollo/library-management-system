# Client-Side Architecture

> Note: Also available in the project-wide documentation at [docs/client-architecture.md](file:///c:/Users/HomePC/Documents/PLP/MEARN/Week1/library%20management%20system/docs/client-architecture.md).

---

## 1. High-Level Component Diagram

```mermaid
flowchart TD
    User([User Browser])
    ViteServer["Vite Dev / Static Bundle"]
    ReactApp["React 19 Application (src/main.jsx)"]
    Router["React Router (BrowserRouter)"]
    AppLayout["AppLayout Shell"]
    Header["SiteHeader"]
    Catalog["CatalogPage (Route: /)"]
    Detail["BookDetailPage (Route: /books/:id)"]
    Footer["SiteFooter"]
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

## 2. Component Hierarchy

```mermaid
graph TD
    App["App (BrowserRouter)"]
    AppLayout["AppLayout (Shell)"]
    SiteHeader["SiteHeader (Navbar & Brand)"]
    Routes["Routes (Switch)"]
    CatalogPage["CatalogPage (Home / Collection)"]
    BookDetailPage["BookDetailPage (/books/:id)"]
    NotFound["404 Not Found Page"]
    SiteFooter["SiteFooter"]

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
    BookGrid --> BookCard["BookCard Component"]
    BookCard --> BookMark["BookMark (SVG/CSS Procedural Cover)"]

    BookDetailPage --> DetailLayout["Detail Layout"]
    DetailLayout --> BookMarkLarge["BookMark (large=true)"]
```

---

## 3. Data & State Lifecycle

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
    Debounce->>Catalog: Update debouncedSearch state
    Catalog->>Fetch: fetchApi('/books?page=1&limit=12&q=...')
    Fetch->>API: GET /books?page=1&limit=12&q=...
    API-->>Catalog: Filtered results
    Catalog-->>User: Update Grid UI
```
