import type {
  ApiResponse,
  CreateMoviePayload,
  DeduplicateResponse,
  DrawnMovie,
  GetMoviesParams,
  GetMoviesResponse,
  Movie,
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
    userRating: normalizeUserRating(raw.userRating ?? raw.user_rating),
  };
}

/** Valores válidos: 0, 0.5, 1, ... 10. Arredonda para múltiplo de 0,5 ou null. */
function normalizeUserRating(v: unknown): number | null {
  if (v == null) return null;
  const n = Number(v);
  if (Number.isNaN(n) || n < 0 || n > 10) return null;
  const half = Math.round(n * 2) / 2;
  return half;
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
    const message =
      typeof err.message === "string"
        ? err.message
        : Array.isArray(err.message)
          ? err.message.join(" ")
          : String(err.message ?? res.statusText);
    throw new Error(message);
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
): Promise<GetMoviesResponse> {
  const search = new URLSearchParams();
  if (params.search) search.set("search", params.search);
  if (params.watched !== undefined) search.set("watched", String(params.watched));
  if (params.year) search.set("year", String(params.year));
  if (params.director) search.set("director", params.director);
  if (params.page) search.set("page", String(params.page));
  if (params.limit) search.set("limit", String(params.limit));

  const query = search.toString();
  const result = await apiFetch<{
    data: Record<string, unknown>[];
    meta: PaginationMeta;
    watched: Record<string, unknown>[];
    unwatched: Record<string, unknown>[];
  }>(`/movies${query ? `?${query}` : ""}`, {
    token,
    next: { tags: ["movies"] },
  } as RequestInit & { token: string });

  const r = result as Record<string, unknown>;
  const rawWatched = (r?.watched ?? r?.watched_list ?? []) as Record<string, unknown>[];
  const rawUnwatched = (r?.unwatched ?? r?.unwatched_list ?? []) as Record<string, unknown>[];
  const rawData = (r?.data ?? []) as Record<string, unknown>[];
  const rawMeta = r?.meta as PaginationMeta;

  // #region agent log
  fetch('http://127.0.0.1:7315/ingest/91794988-f3a4-4423-a884-4d00087f0612',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'9dbbe4'},body:JSON.stringify({sessionId:'9dbbe4',location:'api.ts:getMovies:raw',message:'API raw response',data:{keys:Object.keys(r||{}),watchedLen:rawWatched.length,unwatchedLen:rawUnwatched.length,firstWatched:rawWatched[0]?{id:rawWatched[0].id,watched:rawWatched[0].watched}:null,firstUnwatched:rawUnwatched[0]?{id:rawUnwatched[0].id,watched:rawUnwatched[0].watched}:null},timestamp:Date.now(),hypothesisId:'H1,H2'})}).catch(()=>{});
  // #endregion

  const out = {
    data: rawData.map((m) => normalizeMovie(m)),
    meta: rawMeta ?? { total: 0, page: 1, limit: 24, totalPages: 0 },
    watched: rawWatched.map((m) => normalizeMovie(m)),
    unwatched: rawUnwatched.map((m) => normalizeMovie(m)),
  };
  // #region agent log
  const nw = out.watched[0];
  const nu = out.unwatched[0];
  fetch('http://127.0.0.1:7315/ingest/91794988-f3a4-4423-a884-4d00087f0612',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'9dbbe4'},body:JSON.stringify({sessionId:'9dbbe4',location:'api.ts:getMovies:normalized',message:'After normalize',data:{firstWatched:nw?{id:nw.id,watched:nw.watched}:null,firstUnwatched:nu?{id:nu.id,watched:nu.watched}:null},timestamp:Date.now(),hypothesisId:'H4,H5'})}).catch(()=>{});
  // #endregion
  return out;
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

export async function addMovieToDrawn(
  movieId: string,
  token: string
): Promise<DrawnMovie> {
  return apiFetch<DrawnMovie>("/movies/drawn", {
    method: "POST",
    body: JSON.stringify({ movieId }),
    token,
  } as RequestInit & { token: string });
}

/** Payload para adicionar à lista de sorteados direto pela TMDB (cria filme e adiciona). */
export interface AddToDrawnFromTmdbPayload {
  title: string;
  tmdbId?: number;
  year?: number;
}

export async function addMovieToDrawnFromTmdb(
  payload: AddToDrawnFromTmdbPayload,
  token: string
): Promise<DrawnMovie> {
  return apiFetch<DrawnMovie>("/movies/drawn/from-tmdb", {
    method: "POST",
    body: JSON.stringify(payload),
    token,
  } as RequestInit & { token: string });
}

export async function deduplicateMovies(token: string): Promise<DeduplicateResponse> {
  const raw = await apiFetch<Record<string, unknown>>("/movies/deduplicate", {
    method: "POST",
    token,
  } as RequestInit & { token: string });
  const removedCount = Number(raw?.removedCount ?? raw?.removed_count ?? 0);
  const groupsRaw = raw?.groups as Array<{ kept: Record<string, unknown>; removed: Record<string, unknown>[] }> | undefined;
  const groups = Array.isArray(groupsRaw)
    ? groupsRaw.map((g) => ({
        kept: normalizeMovie(g.kept),
        removed: (g.removed ?? []).map((m) => normalizeMovie(m)),
      }))
    : [];
  return { removedCount, groups };
}

// ─── TMDB Search (direto no cliente via API do Next.js) ──────────────────────

export async function searchTmdb(query: string) {
  if (!query.trim()) return [];
  const res = await fetch(`/api/tmdb/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) return [];
  return res.json();
}
