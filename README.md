# Library API

A REST API backend for a small library system. It manages **books**, the **genres** they belong to, and **users** (patrons and librarians). The data layer is built with Prisma on PostgreSQL, and the HTTP layer is built with NestJS.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Framework | [NestJS](https://nestjs.com/) |
| Language | TypeScript |
| ORM | [Prisma](https://www.prisma.io/) 6 |
| Database | PostgreSQL (hosted on [Neon](https://neon.tech/)) |
| Seed runner | [tsx](https://github.com/privatenumber/tsx) |

## Data Model

| Model | Purpose | Key fields |
| --- | --- | --- |
| `User` | A person using the library | `email` (unique), `name`, `role` |
| `Genre` | A category of books | `name` (unique) |
| `Book` | A book in the catalogue | `title`, `author`, `isbn` (unique, optional), `genreId` |

`Role` is an enum with two values: `PATRON` (the default) and `LIBRARIAN`.

The full definition lives in [`prisma/schema.prisma`](prisma/schema.prisma).

## Getting Started

### Prerequisites

- Node.js 20 or newer
- A PostgreSQL database (a free Neon project works fine)

### Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment variables**

   Copy the example file and fill in your own connection string:

   ```bash
   cp .env.example .env
   ```

   On Windows PowerShell, use `Copy-Item .env.example .env`.

   Then edit `.env` and set `DATABASE_URL`. Never commit `.env`; it is listed in `.gitignore`.

3. **Apply the database migrations**

   ```bash
   npx prisma migrate dev
   ```

   This creates the tables and the `Role` enum, and generates the Prisma Client.

4. **Generate the Prisma Client** (needed on a fresh clone, because generated code is not committed)

   ```bash
   npx prisma generate
   ```

5. **Seed the database**

   ```bash
   npx prisma db seed
   ```

   The seed script clears the `Book` and `Genre` tables and then inserts 4 genres with 6 books each (24 books in total). It is safe to run more than once.

6. **Start the API**

   ```bash
   npm run start:dev
   ```

### Useful Commands

| Command | What it does |
| --- | --- |
| `npx prisma studio` | Opens a browser UI to inspect and edit data |
| `npx prisma migrate dev --name <name>` | Creates and applies a new migration after a schema change |
| `npx prisma db seed` | Re-seeds genres and books |
| `npx tsc --noEmit` | Type-checks the project without building |

## Project Structure

```
.
├── prisma/
│   ├── schema.prisma      # Models, enum, and relations
│   ├── migrations/        # SQL migration history
│   └── seed.ts            # Seed data: 4 genres, 24 books
├── src/
│   └── prisma/
│       ├── prisma.module.ts
│       └── prisma.service.ts   # PrismaClient wrapped as a Nest provider
├── books/                 # Books module (controller + service)
└── .env.example           # Environment variable template
```

## Schema Decisions

### Why `Book` references `Genre` instead of embedding it

Each `Book` stores a `genreId` foreign key pointing at a row in the `Genre` table, declared with `@relation`. It does not copy the genre's data into the book. This was a deliberate choice:

1. **One source of truth.** A genre such as "Science Fiction" exists exactly once. If the name is corrected or renamed, one row changes and every book reflects it. Embedding the genre in each book would mean updating hundreds of rows and risking some being missed.

2. **No inconsistent duplicates.** If the genre were embedded as text, the same genre could be stored as "Sci-Fi", "Science fiction" and "Science Fiction", and queries would silently miss books. The unique constraint on `Genre.name` prevents this.

3. **The relationship is one-to-many.** Many books belong to one genre. In a relational database like PostgreSQL, the standard way to model this is to put the foreign key on the "many" side, which is `Book`.

4. **Referential integrity.** The database itself guarantees that every book points at a real genre. The relation uses `onDelete: Restrict`, so a genre that still has books cannot be deleted by accident.

5. **Genres are queryable in their own right.** Listing all genres, counting books per genre, or fetching all books in a genre are simple, indexed lookups. Prisma's `include` still lets a client fetch a book together with its genre in one call, so referencing costs nothing in convenience.

Embedding is a better fit for document databases such as MongoDB, or for data that is only ever read together and never shared. Neither applies here: genres are shared across many books, and this project uses a relational database.

### Other decisions

- **UUID primary keys** (`@default(uuid())`) instead of auto-incrementing integers, so IDs are not guessable or sequential.
- **`isbn` is optional but unique.** Not every record has one, but two books can never share one.
- **`role` defaults to `PATRON`.** New users get the least-privileged role unless explicitly made a librarian.
- **Timestamps on every model.** `createdAt` and `updatedAt` are maintained automatically by Prisma.

## Security Notes

- Real credentials belong only in `.env`, which is git-ignored.
- `.env.example` contains a placeholder `DATABASE_URL` and nothing sensitive.
- If a real connection string is ever committed or shared by accident, rotate the database password immediately.

## License

See [LICENSE](LICENSE).
