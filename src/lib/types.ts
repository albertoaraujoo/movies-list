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
