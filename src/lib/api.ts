import type {
  ApiResponse,
  CreateMoviePayload,
  DrawnMovie,
  GetMoviesParams,
  Movie,
  PaginatedMovies,
  UpdateMoviePayload,
} from "@/lib/types";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api/v1";

// ─── HTTP Client ─────────────────────────────────────────────────────────────

async function apiFetch<T>(
  path: string,
  options: RequestInit & { token?: string } = {}
): Promise<T> {
  const { token, headers, ...rest } = options;

  const res = await fetch(`${BASE_URL}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({
      statusCode: res.status,
      message: res.statusText,
    }));
    throw new Error(
      Array.isArray(err.message) ? err.message.join(", ") : err.message
    );
  }

  if (res.status === 204) return undefined as T;

  const json: ApiResponse<T> = await res.json();
  return json.data;
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export async function loginWithGoogle(idToken: string) {
  return apiFetch<{ accessToken: string; user: { id: string; email: string; name: string } }>(
    "/auth/google",
    {
      method: "POST",
      body: JSON.stringify({ idToken }),
    }
  );
}

// ─── Movies ──────────────────────────────────────────────────────────────────

export async function getMovies(
  params: GetMoviesParams,
  token: string
): Promise<PaginatedMovies> {
  const search = new URLSearchParams();
  if (params.search) search.set("search", params.search);
  if (params.watched !== undefined) search.set("watched", String(params.watched));
  if (params.year) search.set("year", String(params.year));
  if (params.director) search.set("director", params.director);
  if (params.page) search.set("page", String(params.page));
  if (params.limit) search.set("limit", String(params.limit));

  const query = search.toString();
  return apiFetch<PaginatedMovies>(`/movies${query ? `?${query}` : ""}`, {
    token,
    next: { tags: ["movies"] },
  } as RequestInit & { token: string });
}

export async function getMovie(id: string, token: string): Promise<Movie> {
  return apiFetch<Movie>(`/movies/${id}`, { token } as RequestInit & { token: string });
}

export async function createMovie(
  payload: CreateMoviePayload,
  token: string
): Promise<Movie> {
  return apiFetch<Movie>("/movies", {
    method: "POST",
    body: JSON.stringify(payload),
    token,
  } as RequestInit & { token: string });
}

export async function updateMovie(
  id: string,
  payload: UpdateMoviePayload,
  token: string
): Promise<Movie> {
  return apiFetch<Movie>(`/movies/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
    token,
  } as RequestInit & { token: string });
}

export async function deleteMovie(id: string, token: string): Promise<void> {
  return apiFetch<void>(`/movies/${id}`, {
    method: "DELETE",
    token,
  } as RequestInit & { token: string });
}

export async function syncMovieTmdb(id: string, token: string): Promise<Movie> {
  return apiFetch<Movie>(`/movies/${id}/sync-tmdb`, {
    method: "POST",
    token,
  } as RequestInit & { token: string });
}

// ─── Drawn Movies ─────────────────────────────────────────────────────────────

export async function drawMovie(token: string): Promise<DrawnMovie> {
  return apiFetch<DrawnMovie>("/movies/draw", {
    method: "POST",
    token,
  } as RequestInit & { token: string });
}

export async function getDrawnMovies(token: string): Promise<DrawnMovie[]> {
  return apiFetch<DrawnMovie[]>("/movies/drawn", {
    token,
    next: { tags: ["drawn-movies"] },
  } as RequestInit & { token: string });
}

export async function removeDrawnMovie(
  drawnId: string,
  token: string
): Promise<void> {
  return apiFetch<void>(`/movies/drawn/${drawnId}`, {
    method: "DELETE",
    token,
  } as RequestInit & { token: string });
}

// ─── TMDB Search (direto no cliente via API do Next.js) ──────────────────────

export async function searchTmdb(query: string) {
  if (!query.trim()) return [];
  const res = await fetch(`/api/tmdb/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) return [];
  return res.json();
}
