# API Reference

Referência do cliente HTTP do frontend e dos endpoints do backend utilizados pelo CineList.

## Base URL

Configurada por `NEXT_PUBLIC_API_URL` (ex.: `https://sua-api.onrender.com/api/v1`). Fallback em dev: `http://localhost:3000/api/v1`.

Todas as requisições autenticadas usam o header:

```
Authorization: Bearer <accessToken>
```

O `accessToken` vem da sessão (Auth.js), após o login com Google e a troca de token com o backend.

---

## Autenticação (backend)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `POST` | `/auth/google` | Body: `{ idToken: string }`. Retorna `{ data: { accessToken, user } }`. |

Usado internamente por `loginWithGoogle()` em `src/lib/api.ts`.

---

## Filmes

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/movies?search=&watched=&year=&director=&page=&limit=` | Lista paginada. Query params opcionais. |
| `GET` | `/movies/:id` | Detalhe de um filme. |
| `POST` | `/movies` | Cria filme. Body: `CreateMoviePayload`. |
| `PATCH` | `/movies/:id` | Atualiza filme. Body: `UpdateMoviePayload`. |
| `DELETE` | `/movies/:id` | Remove filme. |
| `POST` | `/movies/:id/sync-tmdb` | Sincroniza dados do TMDB para o filme. |

### Tipos (resumo)

- **CreateMoviePayload:** `title`, `notes?`, `tmdbId?`, `director?`, `year?`, `watched?`
- **UpdateMoviePayload:** `title?`, `notes?`, `watched?`, `director?`, `year?`
- **Movie:** `id`, `title`, `director`, `year`, `notes`, `watched`, `tmdbId`, `posterPath`, `userId`, `createdAt`, `updatedAt`, `overview?`, `runtime?`, `watchProvidersBr?`, etc.
- **PaginatedMovies:** `{ data: Movie[], meta: { total, page, limit, totalPages } }`

**Campos do filme (página de detalhe / TMDB):**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `overview` | `string \| null` | Sinopse do filme (TMDB). |
| `runtime` | `number \| null` | Duração em minutos (TMDB). |
| `watchProvidersBr` | `WatchProvidersBr \| null` | Onde assistir/alugar/comprar no Brasil (JustWatch). |

**WatchProvider:** `logo_path`, `logoUrl?` (URL completa do ícone), `provider_id`, `provider_name`, `display_priority`.

**WatchProvidersBr:** `link?`, `flatrate?` (streaming), `rent?` (aluguel), `buy?` (compra). Cada um é array de `WatchProvider`.

Filmes antigos ou sem dados TMDB podem vir com `overview`, `runtime` e `watchProvidersBr` em `null`. Use `POST /movies/:id/sync-tmdb` para preencher.

---

## Sorteio (drawn)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `POST` | `/movies/draw` | Sorteia um filme da lista do usuário. Retorna `DrawnMovie`. |
| `GET` | `/movies/drawn` | Lista de filmes sorteados (ordem, data). |
| `DELETE` | `/movies/drawn/:drawnId` | Remove um filme da lista de sorteados. |

**DrawnMovie:** `id`, `order`, `drawnAt`, `movie` (objeto `Movie`).

---

## TMDB (via Next.js API Route)

A busca por filmes para autocomplete não chama o backend; o frontend chama uma rota do Next.js que usa a API do TMDB (token em `TMDB_READ_ACCESS_TOKEN`).

| Método | Rota (frontend) | Descrição |
|--------|------------------|-----------|
| `GET` | `/api/tmdb/search?q=<query>` | Busca filmes no TMDB. Retorno: array de resultados (ex.: `TmdbMovie[]`). |

Definida em `src/app/api/tmdb/search/route.ts`.

---

## Cliente em `src/lib/api.ts`

Funções exportadas para uso em componentes e Server Actions:

- **Auth:** `loginWithGoogle(idToken)`
- **Filmes:** `getMovies(params, token)`, `getMovie(id, token)`, `createMovie(payload, token)`, `updateMovie(id, payload, token)`, `deleteMovie(id, token)`, `syncMovieTmdb(id, token)`
- **Sorteio:** `drawMovie(token)`, `getDrawnMovies(token)`, `removeDrawnMovie(drawnId, token)`
- **TMDB:** `searchTmdb(query)` — chama `/api/tmdb/search` no mesmo host

Respostas de erro da API são tratadas: o cliente faz `res.json()` e lança `Error` com a mensagem retornada pelo backend (ou status text).
