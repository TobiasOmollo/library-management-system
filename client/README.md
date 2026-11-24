# Folio Library

The React/Vite client for the library catalog.

## Run locally

1. Start the NestJS API from `api/` (`npm run start:dev`). It listens on `http://localhost:3000` by default.
2. Install client dependencies from `client/` with `npm install`.
3. Optionally create `client/.env` and set `VITE_API_URL` to the API origin if it is not `http://localhost:3000`.
4. Start the client with `npm run dev`.

The client expects the API's public `GET /books`, `GET /books/:id`, and `GET /genres` endpoints. The book catalog supports debounced title/author search, genre filtering, and pagination.

## Checks

Run `npm run lint` and `npm run build` from `client/`.
