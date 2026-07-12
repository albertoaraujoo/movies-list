import type {
  ActivityResponse,
  ApiResponse,
  BulkCreateMoviesPayload,
  CreateListPayload,
  CreateMoviePayload,
  UpdateListPayload,
  CreateReviewPayload,
  DeduplicateResponse,
  DrawnMovie,
  FollowUser,
  GetMoviesParams,
  GetMoviesResponse,
  Movie,
  MovieList,
  NotificationItem,
  NotificationsResponse,
  PaginatedReviews,
  PaginationMeta,
  ProfilePrivacy,
  PublicUserProfile,
  Review,
  ReviewAuthor,
  ReviewComment,
  ReviewThread,
  UpdateMoviePayload,
  UpdateReviewPayload,
  UserProfile,
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
    watched: normalizeWatched(raw.watched),
    tmdbId: raw.tmdbId != null ? Number(raw.tmdbId) : raw.tmdb_id != null ? Number(raw.tmdb_id) : undefined,
    posterPath: raw.posterPath != null ? String(raw.posterPath) : raw.poster_path != null ? String(raw.poster_path) : undefined,
    userId: String(raw.userId ?? raw.user_id),
    createdAt: String(raw.createdAt ?? raw.created_at),
    updatedAt: String(raw.updatedAt ?? raw.updated_at),
    overview: raw.overview != null ? String(raw.overview) : null,
    runtime: raw.runtime != null ? Number(raw.runtime) : null,
    watchProvidersBr: watchProvidersBr ?? null,
    userRating: normalizeUserRating(raw.userRating ?? raw.user_rating),
    genres: Array.isArray(raw.genres) ? raw.genres.map(String) : [],
    review: raw.review ? normalizeReview(raw.review as Record<string, unknown>) : null,
    isFavorite: Boolean(raw.isFavorite ?? raw.is_favorite),
    drawn: normalizeDrawnRef(raw.drawn),
  };
}

function normalizeMovieList(raw: Record<string, unknown>): MovieList {
  const items = Array.isArray(raw.items)
    ? raw.items.map((item) => {
        const row = item as Record<string, unknown>;
        const movieRaw = row.movie as Record<string, unknown> | undefined;
        return {
          id: String(row.id),
          listId: String(row.listId ?? row.list_id),
          movieId: String(row.movieId ?? row.movie_id),
          order: Number(row.order ?? 0),
          movie: movieRaw ? normalizeMovie(movieRaw) : ({} as Movie),
        };
      })
    : undefined;

  return {
    id: String(raw.id),
    name: String(raw.name),
    description: raw.description != null ? String(raw.description) : null,
    isDefault: Boolean(raw.isDefault ?? raw.is_default),
    isFavorites: Boolean(raw.isFavorites ?? raw.is_favorites),
    isNumbered: Boolean(raw.isNumbered ?? raw.is_numbered),
    isRanked: Boolean(raw.isRanked ?? raw.is_ranked),
    userId: String(raw.userId ?? raw.user_id),
    createdAt: String(raw.createdAt ?? raw.created_at),
    updatedAt: String(raw.updatedAt ?? raw.updated_at),
    _count: raw._count as MovieList["_count"],
    items,
  };
}

function normalizeReviewAuthor(raw: unknown): ReviewAuthor | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const a = raw as Record<string, unknown>;
  return {
    id: String(a.id),
    name: String(a.name),
    username: a.username != null ? String(a.username) : null,
    image: a.image != null ? String(a.image) : null,
  };
}

function normalizeReviewComment(raw: Record<string, unknown>): ReviewComment {
  return {
    id: String(raw.id),
    text: String(raw.text),
    reviewId: String(raw.reviewId ?? raw.review_id),
    userId: String(raw.userId ?? raw.user_id),
    parentId:
      raw.parentId != null
        ? String(raw.parentId)
        : raw.parent_id != null
          ? String(raw.parent_id)
          : null,
    createdAt: String(raw.createdAt ?? raw.created_at),
    updatedAt: String(raw.updatedAt ?? raw.updated_at),
    user: normalizeReviewAuthor(raw.user)!,
  };
}

function normalizeReview(raw: Record<string, unknown>): Review {
  return {
    id: String(raw.id),
    text: String(raw.text),
    watchedAt: raw.watchedAt != null ? String(raw.watchedAt) : raw.watched_at != null ? String(raw.watched_at) : null,
    movieId: String(raw.movieId ?? raw.movie_id),
    userId: String(raw.userId ?? raw.user_id),
    createdAt: String(raw.createdAt ?? raw.created_at),
    updatedAt: String(raw.updatedAt ?? raw.updated_at),
    movie: raw.movie ? normalizeMovie(raw.movie as Record<string, unknown>) : undefined,
    user: normalizeReviewAuthor(raw.user),
    likesCount: raw.likesCount != null ? Number(raw.likesCount) : raw.likes_count != null ? Number(raw.likes_count) : undefined,
    commentsCount: raw.commentsCount != null ? Number(raw.commentsCount) : raw.comments_count != null ? Number(raw.comments_count) : undefined,
    likedByMe: raw.likedByMe != null ? Boolean(raw.likedByMe) : raw.liked_by_me != null ? Boolean(raw.liked_by_me) : undefined,
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

function normalizeWatched(v: unknown): boolean {
  if (v === true || v === 1) return true;
  if (v === false || v === 0 || v == null) return false;
  if (typeof v === "string") return v.toLowerCase() === "true";
  return Boolean(v);
}

function normalizeDrawnRef(raw: unknown): Movie["drawn"] {
  if (!raw || typeof raw !== "object") return undefined;
  const d = raw as Record<string, unknown>;
  return {
    id: String(d.id),
    order: Number(d.order ?? 0),
    drawnAt: String(d.drawnAt ?? d.drawn_at ?? ""),
    movie: {} as Movie,
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
  return apiFetch<{
    accessToken: string;
    user: {
      id: string;
      email: string;
      name: string;
      username?: string | null;
      privacy?: ProfilePrivacy;
    };
  }>("/auth/google", {
    method: "POST",
    body: JSON.stringify({ idToken }),
  });
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
  if (params.genre) search.set("genre", params.genre);
  if (params.listId) search.set("listId", params.listId);
  if (params.page) search.set("page", String(params.page));
  if (params.limit) search.set("limit", String(params.limit));

  const query = search.toString();
  const result = await apiFetch<{
    data: Record<string, unknown>[];
    meta: PaginationMeta;
  }>(`/movies${query ? `?${query}` : ""}`, {
    token,
    next: { tags: ["movies"] },
  } as RequestInit & { token: string });

  const r = result as Record<string, unknown>;
  const rawData = (r?.data ?? []) as Record<string, unknown>[];
  const rawMeta = r?.meta as PaginationMeta | undefined;

  return {
    data: rawData.map((m) => normalizeMovie(m)),
    meta: rawMeta ?? { total: 0, page: 1, limit: 24, totalPages: 0 },
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

export async function backfillGenres(
  token: string
): Promise<{ updated: number; remaining: number }> {
  const raw = await apiFetch<Record<string, unknown>>("/movies/backfill-genres", {
    method: "POST",
    token,
  } as RequestInit & { token: string });
  return {
    updated: Number(raw?.updated ?? 0),
    remaining: Number(raw?.remaining ?? 0),
  };
}

export async function bulkCreateMovies(
  payload: BulkCreateMoviesPayload,
  token: string
): Promise<Movie[]> {
  const raw = await apiFetch<Record<string, unknown>[]>("/movies/bulk", {
    method: "POST",
    body: JSON.stringify(payload),
    token,
  } as RequestInit & { token: string });
  return (raw ?? []).map((m) => normalizeMovie(m));
}

// ─── Users ───────────────────────────────────────────────────────────────────

export async function getUserProfile(token: string): Promise<UserProfile> {
  return apiFetch<UserProfile>("/users/profile", { token } as RequestInit & { token: string });
}

export async function checkUsername(username: string, token?: string) {
  return apiFetch<{ available: boolean }>(
    `/users/check-username/${encodeURIComponent(username)}`,
    token ? ({ token } as RequestInit & { token: string }) : {}
  );
}

export async function updateUsername(username: string, token: string) {
  return apiFetch<UserProfile>("/users/update-username", {
    method: "PUT",
    body: JSON.stringify({ username }),
    token,
  } as RequestInit & { token: string });
}

export async function updateProfile(
  payload: { name?: string; username?: string },
  token: string
) {
  return apiFetch<UserProfile>("/users/profile", {
    method: "PUT",
    body: JSON.stringify(payload),
    token,
  } as RequestInit & { token: string });
}

export async function updatePrivacy(privacy: ProfilePrivacy, token: string) {
  return apiFetch<UserProfile>("/users/privacy", {
    method: "PUT",
    body: JSON.stringify({ privacy }),
    token,
  } as RequestInit & { token: string });
}

export async function getPublicProfile(username: string, token: string) {
  return apiFetch<PublicUserProfile>(
    `/users/by-username/${encodeURIComponent(username)}`,
    { token } as RequestInit & { token: string }
  );
}

export async function followUser(id: string, token: string) {
  return apiFetch<void>(`/users/follow/${id}`, {
    method: "POST",
    token,
  } as RequestInit & { token: string });
}

export async function unfollowUser(id: string, token: string) {
  return apiFetch<void>(`/users/unfollow/${id}`, {
    method: "POST",
    token,
  } as RequestInit & { token: string });
}

export async function getFollowers(userId: string, token: string, page = 1) {
  return apiFetch<{ data: FollowUser[]; meta: PaginationMeta }>(
    `/users/${userId}/followers?page=${page}`,
    { token } as RequestInit & { token: string }
  );
}

export async function getFollowing(userId: string, token: string, page = 1) {
  return apiFetch<{ data: FollowUser[]; meta: PaginationMeta }>(
    `/users/${userId}/following?page=${page}`,
    { token } as RequestInit & { token: string }
  );
}

// ─── Reviews ─────────────────────────────────────────────────────────────────

export async function getWatchedReviews(token: string, page = 1): Promise<PaginatedReviews> {
  const raw = await apiFetch<{ data: Record<string, unknown>[]; meta: PaginationMeta }>(
    `/reviews/watched?page=${page}`,
    { token } as RequestInit & { token: string }
  );
  return {
    data: (raw.data ?? []).map((r) => normalizeReview(r)),
    meta: raw.meta,
  };
}

export async function getReviewByMovie(movieId: string, token: string) {
  return apiFetch<Review | null>(`/reviews/movie/${movieId}`, {
    token,
  } as RequestInit & { token: string });
}

export async function createReview(payload: CreateReviewPayload, token: string) {
  const raw = await apiFetch<Record<string, unknown>>("/reviews", {
    method: "POST",
    body: JSON.stringify(payload),
    token,
  } as RequestInit & { token: string });
  return normalizeReview(raw);
}

export async function updateReview(id: string, payload: UpdateReviewPayload, token: string) {
  const raw = await apiFetch<Record<string, unknown>>(`/reviews/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
    token,
  } as RequestInit & { token: string });
  return normalizeReview(raw);
}

export async function deleteReview(id: string, token: string) {
  return apiFetch<void>(`/reviews/${id}`, {
    method: "DELETE",
    token,
  } as RequestInit & { token: string });
}

export async function getReviewThread(reviewId: string, token: string): Promise<ReviewThread> {
  const raw = await apiFetch<Record<string, unknown>>(`/reviews/${reviewId}/thread`, {
    token,
  } as RequestInit & { token: string });
  return {
    review: normalizeReview(raw.review as Record<string, unknown>),
    comments: Array.isArray(raw.comments)
      ? raw.comments.map((c) => normalizeReviewComment(c as Record<string, unknown>))
      : [],
  };
}

export async function getPublicReviews(username: string, token: string, page = 1): Promise<PaginatedReviews> {
  const raw = await apiFetch<{ data: Record<string, unknown>[]; meta: PaginationMeta }>(
    `/reviews/public/${encodeURIComponent(username)}?page=${page}`,
    { token } as RequestInit & { token: string }
  );
  return {
    data: (raw.data ?? []).map((r) => normalizeReview(r)),
    meta: raw.meta,
  };
}

export async function toggleReviewLike(reviewId: string, token: string) {
  return apiFetch<{ liked: boolean; likesCount: number }>(`/reviews/${reviewId}/likes`, {
    method: "POST",
    token,
  } as RequestInit & { token: string });
}

export async function createReviewComment(
  reviewId: string,
  payload: { text: string; parentId?: string },
  token: string
) {
  const raw = await apiFetch<Record<string, unknown>>(`/reviews/${reviewId}/comments`, {
    method: "POST",
    body: JSON.stringify(payload),
    token,
  } as RequestInit & { token: string });
  return normalizeReviewComment(raw);
}

export async function deleteReviewComment(commentId: string, token: string) {
  return apiFetch<void>(`/reviews/comments/${commentId}`, {
    method: "DELETE",
    token,
  } as RequestInit & { token: string });
}

// ─── Lists ───────────────────────────────────────────────────────────────────

export async function getLists(token: string): Promise<MovieList[]> {
  return apiFetch<MovieList[]>("/lists", { token } as RequestInit & { token: string });
}

export async function getList(id: string, token: string): Promise<MovieList> {
  const raw = await apiFetch<Record<string, unknown>>(`/lists/${id}`, {
    token,
  } as RequestInit & { token: string });
  return normalizeMovieList(raw);
}

export async function createList(payload: CreateListPayload, token: string) {
  return apiFetch<MovieList>("/lists", {
    method: "POST",
    body: JSON.stringify(payload),
    token,
  } as RequestInit & { token: string });
}

export async function updateList(id: string, payload: UpdateListPayload, token: string) {
  const raw = await apiFetch<Record<string, unknown>>(`/lists/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
    token,
  } as RequestInit & { token: string });
  return normalizeMovieList(raw);
}

export async function deleteList(id: string, token: string) {
  return apiFetch<void>(`/lists/${id}`, {
    method: "DELETE",
    token,
  } as RequestInit & { token: string });
}

export async function toggleFavorite(movieId: string, token: string) {
  return apiFetch<{ isFavorite: boolean }>("/lists/favorites/toggle", {
    method: "POST",
    body: JSON.stringify({ movieId }),
    token,
  } as RequestInit & { token: string });
}

export async function removeMovieFromList(listId: string, movieId: string, token: string) {
  return apiFetch<void>(`/lists/${listId}/movies/${movieId}`, {
    method: "DELETE",
    token,
  } as RequestInit & { token: string });
}

export async function addMovieToList(listId: string, movieId: string, token: string) {
  return apiFetch<void>(`/lists/${listId}/movies`, {
    method: "POST",
    body: JSON.stringify({ movieId }),
    token,
  } as RequestInit & { token: string });
}

export async function deduplicateList(listId: string, token: string) {
  return apiFetch<{ removedCount: number }>(`/lists/${listId}/deduplicate`, {
    method: "POST",
    token,
  } as RequestInit & { token: string });
}

export async function reorderList(listId: string, movieIds: string[], token: string) {
  const raw = await apiFetch<Record<string, unknown>>(`/lists/${listId}/reorder`, {
    method: "PATCH",
    body: JSON.stringify({ movieIds }),
    token,
  } as RequestInit & { token: string });
  return normalizeMovieList(raw);
}

// ─── Activity ────────────────────────────────────────────────────────────────

export async function getActivity(token: string, scope = "all"): Promise<ActivityResponse> {
  return apiFetch<ActivityResponse>(`/activity?scope=${scope}`, {
    token,
  } as RequestInit & { token: string });
}

// ─── Notifications ───────────────────────────────────────────────────────────

export async function getNotifications(token: string, page = 1): Promise<NotificationsResponse> {
  return apiFetch<NotificationsResponse>(`/notifications?page=${page}`, {
    token,
  } as RequestInit & { token: string });
}

export async function getUnreadNotificationsCount(token: string): Promise<number> {
  return apiFetch<number>("/notifications/unread-count", {
    token,
  } as RequestInit & { token: string });
}

export async function markNotificationAsRead(id: string, token: string): Promise<void> {
  return apiFetch<void>(`/notifications/${id}/read`, {
    method: "PATCH",
    token,
  } as RequestInit & { token: string });
}

export async function markAllNotificationsAsRead(token: string): Promise<void> {
  return apiFetch<void>("/notifications/read-all", {
    method: "PATCH",
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
