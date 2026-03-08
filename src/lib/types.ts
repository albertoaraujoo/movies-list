// ─── Modelos de dados (espelho do backend) ──────────────────────────────────

export interface User {
  id: string;
  email: string;
  name: string;
  image?: string;
}

export interface DrawnMovie {
  id: string;
  order: number;
  drawnAt: string;
  movie: Movie;
}

// Onde assistir (JustWatch / TMDB)
export interface WatchProvider {
  logo_path: string | null;
  /** URL completa do ícone (API já retorna pronta para <img src>) */
  logoUrl?: string;
  provider_id: number;
  provider_name: string;
  display_priority: number;
}

export interface WatchProvidersBr {
  link?: string;
  flatrate?: WatchProvider[];
  rent?: WatchProvider[];
  buy?: WatchProvider[];
}

export interface Movie {
  id: string;
  title: string;
  director?: string;
  year?: number;
  notes?: string;
  watched: boolean;
  tmdbId?: number;
  posterPath?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  drawn?: DrawnMovie;
  overview?: string | null;
  runtime?: number | null;
  watchProvidersBr?: WatchProvidersBr | null;
  /** Nota do usuário (0 a 10 em passos de 0,5). */
  userRating?: number | null;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedMovies {
  data: Movie[];
  meta: PaginationMeta;
}

/** Resposta de GET /movies (inclui listas watched e unwatched). */
export interface GetMoviesResponse {
  data: Movie[];
  meta: PaginationMeta;
  watched: Movie[];
  unwatched: Movie[];
}

/** Resposta de POST /movies/deduplicate. */
export interface DeduplicateResponse {
  removedCount: number;
  groups: Array<{ kept: Movie; removed: Movie[] }>;
}

// ─── Payloads de requisição ──────────────────────────────────────────────────

export interface CreateMoviePayload {
  title: string;
  notes?: string;
  tmdbId?: number;
  director?: string;
  year?: number;
  watched?: boolean;
}

export interface UpdateMoviePayload {
  title?: string;
  notes?: string;
  watched?: boolean;
  director?: string;
  year?: number;
  /** 0 a 10 em passos de 0,5. */
  userRating?: number;
}

export interface GetMoviesParams {
  search?: string;
  watched?: boolean;
  year?: number;
  director?: string;
  page?: number;
  limit?: number;
}

// ─── Resposta padrão da API ──────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  timestamp: string;
  path: string;
}

export interface ApiError {
  statusCode: number;
  message: string | string[];
  path: string;
  timestamp: string;
}

// ─── TMDB ────────────────────────────────────────────────────────────────────

export interface TmdbMovie {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
  overview: string;
  vote_average: number;
}

export interface TmdbSearchResponse {
  results: TmdbMovie[];
  total_results: number;
  total_pages: number;
}

// ─── Auth Session ────────────────────────────────────────────────────────────

export interface AppSession {
  user: User;
  accessToken: string;
}
