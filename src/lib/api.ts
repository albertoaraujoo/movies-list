import type {
  ApiResponse,
  CreateMoviePayload,
  DrawnMovie,
  GetMoviesParams,
  Movie,
  PaginatedMovies,
  PaginationMeta,
  UpdateMoviePayload,
  WatchProvider,
  WatchProvidersBr,
} from "@/lib/types";

const API_URL_FALLBACK = "http://localhost:3000/api/v1";

/** Normaliza filme da API (aceita snake_case do backend) para o tipo Movie. */
function normalizeMovie(raw: Record<string, unknown>): Movie {
  const wpBr = raw.watchProvidersBr ?? raw.watch_providers_br;
  let watchProvidersBr: WatchProvidersBr | null = null;
  if (wpBr && typeof wpBr === "object" && !Array.isArray(wpBr)) {
    const o = wpBr as Record<string, unknown>;
    const normalizeProvider = (p: unknown): WatchProvider | null => {
      if (!p || typeof p !== "object") return null;
      const r = p as Record<string, unknown>;
      return {
        logo_path: r.logo_path != null ? String(r.logo_path) : null,
        logoUrl: r.logoUrl != null ? String(r.logoUrl) : r.logo_url != null ? String(r.logo_url) : undefined,
        provider_id: Number(r.provider_id),
        provider_name: String(r.provider_name ?? ""),
        display_priority: Number(r.display_priority ?? 0),
      };
    };
    const flat = (arr: unknown): WatchProvider[] =>
      Array.isArray(arr)
        ? arr.map((p) => normalizeProvider(p)).filter((x): x is WatchProvider => x != null)
        : [];
    watchProvidersBr = {
      ...(o.link != null ? { link: String(o.link) } : {}),
      ...(o.flatrate ? { flatrate: flat(o.flatrate) } : {}),
      ...(o.rent ? { rent: flat(o.rent) } : {}),
      ...(o.buy ? { buy: flat(o.buy) } : {}),
    };
  }

  return {
    id: String(raw.id),
    title: String(raw.title),
    director: raw.director != null ? String(raw.director) : undefined,
    year: raw.year != null ? Number(raw.year) : undefined,
    notes: raw.notes != null ? String(raw.notes) : undefined,
    watched: Boolean(raw.watched),
    tmdbId: raw.tmdbId != null ? Number(raw.tmdbId) : raw.tmdb_id != null ? Number(raw.tmdb_id) : undefined,
    posterPath: raw.posterPath != null ? String(raw.posterPath) : raw.poster_path != null ? String(raw.poster_path) : undefined,
    userId: String(raw.userId ?? raw.user_id),
    createdAt: String(raw.createdAt ?? raw.created_at),
    updatedAt: String(raw.updatedAt ?? raw.updated_at),
    overview: raw.overview != null ? String(raw.overview) : null,
    runtime: raw.runtime != null ? Number(raw.runtime) : null,
    watchProvidersBr: watchProvidersBr ?? null,
  };
}

/** Em dev no cliente: usa proxy (same-origin). No servidor ou em prod: usa URL da API. */
function getApiBase(): { base: string; prefix: string } {
  const isDev = process.env.NODE_ENV === "development";
  const fullUrl = process.env.NEXT_PUBLIC_API_URL ?? API_URL_FALLBACK;
  if (typeof window !== "undefined" && isDev) {
    return { base: "", prefix: "/api/v1" };
  }
  return { base: fullUrl, prefix: "" };
}

// ─── HTTP Client ─────────────────────────────────────────────────────────────

async function apiFetch<T>(
  path: string,
  options: RequestInit & { token?: string } = {}
): Promise<T> {
  const { token, headers, ...rest } = options;
  const { base, prefix } = getApiBase();
  const url = `${base}${prefix}${path}`;

  const res = await fetch(url, {
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
  const result = await apiFetch<{ data: Record<string, unknown>[]; meta: PaginationMeta }>(
    `/movies${query ? `?${query}` : ""}`,
    { token, next: { tags: ["movies"] } } as RequestInit & { token: string }
  );
  return {
    data: result.data.map((m) => normalizeMovie(m)),
    meta: result.meta,
  };
}

export async function getMovie(id: string, token: string): Promise<Movie> {
  const raw = await apiFetch<Record<string, unknown>>(`/movies/${id}`, {
    token,
  } as RequestInit & { token: string });
  return normalizeMovie(raw);
}

export async function createMovie(
  payload: CreateMoviePayload,
  token: string
): Promise<Movie> {
  const raw = await apiFetch<Record<string, unknown>>("/movies", {
    method: "POST",
    body: JSON.stringify(payload),
    token,
  } as RequestInit & { token: string });
  return normalizeMovie(raw);
}

export async function updateMovie(
  id: string,
  payload: UpdateMoviePayload,
  token: string
): Promise<Movie> {
  const raw = await apiFetch<Record<string, unknown>>(`/movies/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
    token,
  } as RequestInit & { token: string });
  return normalizeMovie(raw);
}

export async function deleteMovie(id: string, token: string): Promise<void> {
  return apiFetch<void>(`/movies/${id}`, {
    method: "DELETE",
    token,
  } as RequestInit & { token: string });
}

export async function syncMovieTmdb(id: string, token: string): Promise<Movie> {
  const raw = await apiFetch<Record<string, unknown>>(`/movies/${id}/sync-tmdb`, {
    method: "POST",
    token,
  } as RequestInit & { token: string });
  return normalizeMovie(raw);
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
