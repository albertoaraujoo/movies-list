# API Reference

Reference for the frontend HTTP client and the backend endpoints used by CineList.

## Base URL

Configured via `NEXT_PUBLIC_API_URL` (e.g. `https://your-api.onrender.com/api/v1`). Fallback in dev: `http://localhost:3000/api/v1`.

All authenticated requests use the header:

```
Authorization: Bearer <accessToken>
```

The `accessToken` comes from the session (Auth.js) after Google login and token exchange with the backend.

---

## Authentication (backend)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/google` | Body: `{ idToken: string }`. Returns `{ data: { accessToken, user } }`. |

Used internally by `loginWithGoogle()` in `src/lib/api.ts`.

---

## Movies

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/movies?search=&watched=&year=&director=&page=&limit=` | Paginated list. Optional query params. |
| `GET` | `/movies/:id` | Single movie. |
| `POST` | `/movies` | Create movie. Body: `CreateMoviePayload`. |
| `PATCH` | `/movies/:id` | Update movie. Body: `UpdateMoviePayload`. |
| `DELETE` | `/movies/:id` | Delete movie. |
| `POST` | `/movies/:id/sync-tmdb` | Sync TMDB data for the movie. |

### Types (summary)

- **CreateMoviePayload:** `title`, `notes?`, `tmdbId?`, `director?`, `year?`, `watched?`
- **UpdateMoviePayload:** `title?`, `notes?`, `watched?`, `director?`, `year?`
- **Movie:** `id`, `title`, `director`, `year`, `notes`, `watched`, `tmdbId`, `posterPath`, `userId`, `createdAt`, `updatedAt`, `overview?`, `runtime?`, `watchProvidersBr?`, etc.
- **PaginatedMovies:** `{ data: Movie[], meta: { total, page, limit, totalPages } }`

**Movie fields (detail page / TMDB):**

| Field | Type | Description |
|-------|------|-------------|
| `overview` | `string \| null` | Movie synopsis (TMDB). |
| `runtime` | `number \| null` | Runtime in minutes (TMDB). |
| `watchProvidersBr` | `WatchProvidersBr \| null` | Where to watch/rent/buy in Brazil (JustWatch). |

**WatchProvider:** `logo_path`, `logoUrl?` (full icon URL), `provider_id`, `provider_name`, `display_priority`.

**WatchProvidersBr:** `link?`, `flatrate?` (streaming), `rent?` (rent), `buy?` (buy). Each is an array of `WatchProvider`.

Older movies or those without TMDB data may have `overview`, `runtime`, and `watchProvidersBr` as `null`. Use `POST /movies/:id/sync-tmdb` to fill them.

---

## Draw (drawn movies)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/movies/draw` | Draws a movie from the user's list. Returns `DrawnMovie`. |
| `GET` | `/movies/drawn` | List of drawn movies (order, date). |
| `DELETE` | `/movies/drawn/:drawnId` | Removes a movie from the drawn list. |

**DrawnMovie:** `id`, `order`, `drawnAt`, `movie` (`Movie` object).

---

## TMDB (via Next.js API route)

Movie search for autocomplete does not call the backend; the frontend calls a Next.js route that uses the TMDB API (token in `TMDB_READ_ACCESS_TOKEN`).

| Method | Route (frontend) | Description |
|--------|------------------|-------------|
| `GET` | `/api/tmdb/search?q=<query>` | Search movies on TMDB. Returns array of results (e.g. `TmdbMovie[]`). |

Defined in `src/app/api/tmdb/search/route.ts`.

---

## Client in `src/lib/api.ts`

Exported functions for use in components and Server Actions:

- **Auth:** `loginWithGoogle(idToken)`
- **Movies:** `getMovies(params, token)`, `getMovie(id, token)`, `createMovie(payload, token)`, `updateMovie(id, payload, token)`, `deleteMovie(id, token)`, `syncMovieTmdb(id, token)`
- **Draw:** `drawMovie(token)`, `getDrawnMovies(token)`, `removeDrawnMovie(drawnId, token)`
- **TMDB:** `searchTmdb(query)` — calls `/api/tmdb/search` on the same host

API error responses are handled: the client parses `res.json()` and throws `Error` with the backend message (or status text).
