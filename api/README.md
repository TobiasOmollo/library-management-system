# Library API

A REST API for a small library system, built with **NestJS**, **Prisma** and **PostgreSQL**. It manages books and genres, and it has JWT authentication with two roles: members can browse the catalogue, and librarians can manage it.

## Features

- Register and log in with email and password; the login route returns a JWT access token
- Role-based access control: `MEMBER` and `LIBRARIAN`
- Full CRUD for **Books** and **Genres**, with validated DTOs
- Book search (`q`), genre filtering (`genreId` or `genre`) and pagination
- Global request validation: unknown fields are rejected, types are coerced
- Rate limiting on all routes, with stricter limits on login and registration
- Seed script that creates a librarian account, 4 genres and 9 sample books

## Tech Stack

| Layer | Technology |
| --- | --- |
| Framework | [NestJS](https://nestjs.com/) |
| Language | TypeScript |
| ORM | [Prisma](https://www.prisma.io/) 6 |
| Database | PostgreSQL (hosted on [Neon](https://neon.tech/)) |
| Auth | `@nestjs/jwt`, `@nestjs/passport`, `passport-jwt`, `bcrypt` |
| Validation | `class-validator`, `class-transformer` |
| Rate limiting | `@nestjs/throttler` |
| Seed runner | [tsx](https://github.com/privatenumber/tsx) |

## Project Structure

The repository root holds the README, license and `.gitignore`. The NestJS app lives in `api/`, so run all `npm` and `npx` commands from there.

```
library-api/
├── README.md
├── LICENSE
├── .gitignore
└── api/
    ├── .env.example               # Environment variable template
    ├── prisma/
    │   ├── schema.prisma          # Models, enum and relations
    │   ├── migrations/            # SQL migration history
    │   └── seed.ts                # Librarian, genres and books
    ├── scripts/
    │   └── list-routes.ts         # Prints every route (like `rails routes`)
    ├── src/
    │   ├── main.ts                # Bootstrap + global ValidationPipe
    │   ├── app.module.ts          # Root module, config, global throttler
    │   ├── auth/                  # Register, login, JWT strategy, guards, @Roles()
    │   ├── books/                 # Books controller, service, DTOs
    │   ├── genres/                # Genres controller, service, DTOs
    │   ├── users/                 # Users service (used by auth)
    │   └── prisma/                # PrismaClient wrapped as a Nest provider
    ├── prisma.config.ts           # Prisma CLI config (schema, migrations, seed)
    ├── nest-cli.json
    ├── tsconfig.json
    └── test_api.ps1               # End-to-end smoke test (PowerShell)
```

## Getting Started

### Prerequisites

- Node.js 20 or newer
- A PostgreSQL database (a free Neon project works fine)

### Setup

All commands below run from the `api/` folder.

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment variables**

   ```bash
   cp .env.example .env
   ```

   On Windows PowerShell, use `Copy-Item .env.example .env`.

   Then edit `.env` (see [Environment Variables](#environment-variables)). At minimum, set `DATABASE_URL` and a strong `JWT_SECRET`.

3. **Apply the database migrations**

   ```bash
   npx prisma migrate dev
   ```

   This creates the tables and enum and generates the Prisma Client.

4. **Generate the Prisma Client** (needed on a fresh clone, because generated code is not committed)

   ```bash
   npx prisma generate
   ```

5. **Seed the database**

   ```bash
   npx prisma db seed
   ```

6. **Start the API**

   ```bash
   npm run start:dev
   ```

   The API listens on `http://localhost:3000` unless `PORT` is set.

### Environment Variables

| Variable | Required | Description |
| --- | --- | --- |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `DIRECT_URL` | No | Direct (non-pooled) connection string. Listed in `.env.example` but not currently read by `schema.prisma` |
| `JWT_SECRET` | Yes | Secret used to sign and verify JWTs. Generate one with `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `JWT_EXPIRES_IN` | No | Access token lifetime. Defaults to `1h` |
| `SEED_LIBRARIAN_EMAIL` | No | Seeded librarian email. Defaults to `librarian@example.com` |
| `SEED_LIBRARIAN_PASSWORD` | No | Seeded librarian password. Defaults to `Librarian123!` |
| `PORT` | No | HTTP port. Defaults to `3000` |

Change the seeded librarian credentials before deploying anywhere public.

### Useful Commands

| Command | What it does |
| --- | --- |
| `npm run start:dev` | Starts the API in watch mode |
| `npm run build` | Compiles to `dist/` |
| `npm run start:prod` | Runs the compiled app (`node dist/main`) |
| `npm run routes` | Lists every route and who can access it |
| `npm run seed` | Re-runs the seed script |
| `npx prisma studio` | Opens a browser UI to inspect and edit data |
| `npx prisma migrate dev --name <name>` | Creates and applies a migration after a schema change |
| `npx tsc --noEmit` | Type-checks the project without building |

## API Reference

Send the token as `Authorization: Bearer <access_token>`.

### Routes

| Method | Path | Access | Description |
| --- | --- | --- | --- |
| POST | `/auth/register` | Public (10/min) | Create a `MEMBER` account |
| POST | `/auth/login` | Public (5/min) | Returns `{ "access_token": "..." }` |
| GET | `/auth/me` | Any logged-in user | Current user profile |
| GET | `/genres` | Public | List genres with book counts |
| GET | `/genres/:id` | Public | One genre with its books |
| POST | `/genres` | Librarian | Create a genre |
| PATCH | `/genres/:id` | Librarian | Update a genre |
| DELETE | `/genres/:id` | Librarian | Delete a genre (409 if it still has books) |
| GET | `/books` | Public | Search, filter and paginate books |
| GET | `/books/:id` | Public | One book with its genre |
| POST | `/books` | Librarian | Create a book |
| PATCH | `/books/:id` | Librarian | Update a book |
| DELETE | `/books/:id` | Librarian | Delete a book |

Run `npm run routes` to print this table from the live code.

### Searching and filtering books

`GET /books` accepts these query parameters:

| Param | Type | Description |
| --- | --- | --- |
| `q` | string | Case-insensitive search across title and author |
| `genreId` | UUID | Only books in this genre |
| `genre` | string | Genre name (case-insensitive, partial match). Ignored if `genreId` is given |
| `page` | integer | Page number, starting at 1. Default `1` |
| `limit` | integer | Items per page, 1 to 50. Default `10` |

Example:

```
GET /books?q=history&genre=science&page=1&limit=5
```

Response shape:

```json
{
  "data": [ { "id": "...", "title": "...", "genre": { "id": "...", "name": "..." } } ],
  "total": 12,
  "page": 1,
  "limit": 5
}
```

### Request bodies

**Register** (`POST /auth/register`)

```json
{ "email": "alice@example.com", "password": "Password123!", "name": "Alice" }
```

`password` needs at least 8 characters and `name` is optional. The role is always `MEMBER`; a client cannot choose it.

**Login** (`POST /auth/login`)

```json
{ "email": "alice@example.com", "password": "Password123!" }
```

**Create book** (`POST /books`, librarian only)

```json
{
  "title": "Dune",
  "author": "Frank Herbert",
  "isbn": "978-0441013593",
  "description": "A desert planet and a fight for spice.",
  "publishedYear": 1965,
  "copies": 3,
  "available": 3,
  "genreId": "<genre uuid>"
}
```

Only `title`, `author` and `genreId` are required. `PATCH /books/:id` accepts any subset of these fields.

**Create genre** (`POST /genres`, librarian only)

```json
{ "name": "Mystery" }
```

### Error responses

| Status | When |
| --- | --- |
| 400 | Validation failed, an unknown field was sent, or `:id` is not a valid UUID |
| 401 | Missing, invalid or expired token, or wrong login credentials |
| 403 | Logged in, but not a librarian |
| 404 | Book or genre not found |
| 409 | Duplicate email, genre name or ISBN, or deleting a genre that still has books |
| 429 | Rate limit exceeded |

## Authentication and Authorization

- Passwords are hashed with bcrypt and never returned by the API.
- A login returns a JWT whose payload holds the user's `sub` (id), `email` and `role`.
- `JwtAuthGuard` verifies the token. `RolesGuard` then checks the role set by `@Roles('LIBRARIAN')` on a route.
- Book and genre write routes are guarded with `@UseGuards(JwtAuthGuard, RolesGuard)` and `@Roles('LIBRARIAN')`.
- The role is read from the token, so a role change in the database takes effect only after the user's current token expires.
- There are no refresh tokens yet. When the access token expires, the user logs in again.

### Rate limiting

| Scope | Limit |
| --- | --- |
| All routes (default) | 100 requests per minute |
| `POST /auth/register` | 10 per minute |
| `POST /auth/login` | 5 per minute |

Limits are tracked per client IP, in memory. If you run behind a proxy or load balancer, configure Nest's `trust proxy` setting so the real client IP is used.

## Data Model

| Model | Purpose | Key fields |
| --- | --- | --- |
| `User` | A person using the library | `email` (unique), `passwordHash`, `name`, `role` |
| `Genre` | A category of books | `name` (unique) |
| `Book` | A book in the catalogue | `title`, `author`, `isbn` (unique, optional), `description`, `publishedYear`, `copies`, `available`, `genreId` |
| `Review` | A user's rating of a book | `rating`, `comment`, `bookId`, `userId` (one review per user per book) |

`Role` is an enum with two values: `MEMBER` (the default) and `LIBRARIAN`.

The `Review` model exists in the schema and migrations, but no reviews routes are implemented yet.

The full definition lives in [`api/prisma/schema.prisma`](api/prisma/schema.prisma).

## Seed Data

`npx prisma db seed` is safe to run more than once, because every record is created with an upsert:

- **1 librarian** account, using `SEED_LIBRARIAN_EMAIL` and `SEED_LIBRARIAN_PASSWORD`. Re-running the seed resets this account's password to the value in `.env`.
- **4 genres**: Fiction, Science, History, Fantasy.
- **9 books** spread across those genres, matched by ISBN.

## Testing

`api/test_api.ps1` is a PowerShell smoke test that starts the compiled server and checks:

- register, login and `/auth/me`
- login as the seeded librarian
- a member getting 403 on `POST /books`
- librarian create, update and delete of a book
- search and genre filtering
- a 400 on an invalid body
- a 429 after repeated logins

To use it, run `npm run build` and `npx prisma db seed` first. The script has a hard-coded project path near the top, so edit `-WorkingDirectory` to match your machine. It assumes the default seeded librarian credentials.

The script exercises the login rate limit, so wait a minute before running it a second time.

## Schema Decisions

### Why `Book` references `Genre` instead of embedding it

Each `Book` stores a `genreId` foreign key pointing at a row in the `Genre` table, declared with `@relation`. It does not copy the genre's data into the book. This was a deliberate choice:

1. **One source of truth.** A genre such as "Science Fiction" exists exactly once. If the name is corrected, one row changes and every book reflects it.
2. **No inconsistent duplicates.** If the genre were embedded as text, the same genre could be stored as "Sci-Fi", "Science fiction" and "Science Fiction", and queries would silently miss books. The unique constraint on `Genre.name` prevents this.
3. **The relationship is one-to-many.** Many books belong to one genre, so the foreign key goes on the "many" side, which is `Book`.
4. **Referential integrity.** The database guarantees that every book points at a real genre. The relation uses `onDelete: Restrict`, so a genre that still has books cannot be deleted by accident.
5. **Genres are queryable in their own right.** Listing genres, counting books per genre, or fetching all books in a genre are simple lookups, and Prisma's `include` still returns a book together with its genre in one call.

Embedding is a better fit for document databases such as MongoDB, or for data that is only ever read together. Neither applies here.

### Other decisions

- **UUID primary keys** (`@default(uuid())`) instead of auto-incrementing integers, so IDs are not guessable or sequential.
- **`isbn` is optional but unique.** Not every record has one, but two books can never share one.
- **`role` defaults to `MEMBER`.** New users get the least-privileged role unless explicitly made a librarian.
- **Reviews cascade.** Deleting a user or a book deletes their reviews, while deleting a genre is blocked if books remain.
- **Timestamps on every model.** `createdAt` and `updatedAt` are maintained automatically by Prisma.

## Security Notes

- Real credentials belong only in `.env`, which is git-ignored. Only `.env.example` is committed, and it holds placeholders.
- Use a long random `JWT_SECRET`. Anyone who knows it can forge a librarian token.
- Change the seeded librarian password before deploying.
- If a real connection string or secret is ever committed or shared by accident, rotate it immediately.

## License

MIT. See [LICENSE](LICENSE).
