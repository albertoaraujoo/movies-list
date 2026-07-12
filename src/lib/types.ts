// ─── Modelos de dados (espelho do backend) ──────────────────────────────────

export type ProfilePrivacy = "public" | "private" | "friends";

export interface User {
  id: string;
  email: string;
  name: string;
  image?: string;
  username?: string | null;
  privacy?: ProfilePrivacy;
  bio?: string | null;
}

export interface UserProfile extends User {
  totalMovies: number;
  uniqueListMoviesCount: number;
  watchedMovies: number;
  listsCount: number;
  followersCount: number;
  followingCount: number;
  usernameUpdatedAt?: string | null;
  nameEditedAt?: string | null;
  canChangeUsername?: boolean;
  daysUntilUsernameChange?: number;
}

export interface PublicUserProfile {
  id: string;
  name: string;
  image: string | null;
  username: string;
  privacy: ProfilePrivacy;
  bio: string | null;
  watchedMovies: number;
  listsCount: number;
  followersCount: number;
  followingCount: number;
  isFollowing?: boolean;
  followsYou?: boolean;
  isMutual?: boolean;
}

export interface FollowUser {
  id: string;
  name: string;
  username: string | null;
  image: string | null;
  isFollowing?: boolean;
  followsYou?: boolean;
}

export interface UserSearchResult {
  id: string;
  name: string;
  username: string;
  image: string | null;
  isFollowing: boolean;
}

export type NotificationType = "user_followed";

export interface NotificationItem {
  id: string;
  type: NotificationType;
  readAt: string | null;
  createdAt: string;
  actor: FollowUser;
  isFollowingActor: boolean;
}

export interface NotificationsResponse {
  data: NotificationItem[];
  meta: PaginationMeta;
}

export interface DrawnMovie {
  id: string;
  order: number;
  drawnAt: string;
  movie: Movie;
}

export interface ReviewAuthor {
  id: string;
  name: string;
  username: string | null;
  image: string | null;
}

export interface Review {
  id: string;
  text: string;
  watchedAt: string | null;
  movieId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  movie?: Movie;
  user?: ReviewAuthor;
  likesCount?: number;
  commentsCount?: number;
  likedByMe?: boolean;
}

export interface ReviewComment {
  id: string;
  text: string;
  reviewId: string;
  userId: string;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
  user: ReviewAuthor;
  replies?: ReviewComment[];
}

export interface ReviewThread {
  review: Review;
  comments: ReviewComment[];
}

export interface MovieList {
  id: string;
  name: string;
  description?: string | null;
  isDefault: boolean;
  isFavorites: boolean;
  isNumbered: boolean;
  isRanked: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
  _count?: { items: number };
  items?: MovieListItem[];
}

export interface MovieListItem {
  id: string;
  listId: string;
  movieId: string;
  order: number;
  movie: Movie;
}

export type ActivityType = "movie_watched" | "list_created";

export interface ActivityLog {
  id: string;
  type: ActivityType;
  userId: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  user: {
    id: string;
    name: string;
    username: string | null;
    image: string | null;
  };
}

export interface ActivityResponse {
  mine: ActivityLog[];
  following: ActivityLog[];
}

// Onde assistir (JustWatch / TMDB)
export interface WatchProvider {
  logo_path: string | null;
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
  review?: Review | null;
  overview?: string | null;
  runtime?: number | null;
  watchProvidersBr?: WatchProvidersBr | null;
  genres?: string[];
  userRating?: number | null;
  isFavorite?: boolean;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  watchedTotal?: number;
  unwatchedTotal?: number;
}

export interface PaginatedMovies {
  data: Movie[];
  meta: PaginationMeta;
}

export interface PaginatedReviews {
  data: Review[];
  meta: PaginationMeta;
}

/** Resposta de GET /movies. */
export interface GetMoviesResponse {
  data: Movie[];
  meta: PaginationMeta;
}

/** Resposta de POST /movies/deduplicate. */
export interface DeduplicateResponse {
  removedCount: number;
  groups: Array<{ kept: Movie; removed: Movie[] }>;
}

export interface ListDeduplicateResponse {
  removedCount: number;
}

// ─── Payloads de requisição ──────────────────────────────────────────────────

export interface CreateMoviePayload {
  title: string;
  notes?: string;
  tmdbId?: number;
  director?: string;
  year?: number;
  watched?: boolean;
  listIds?: string[];
}

export interface BulkCreateMoviesPayload {
  movies: CreateMoviePayload[];
  listIds?: string[];
}

export interface UpdateMoviePayload {
  title?: string;
  notes?: string;
  watched?: boolean;
  director?: string;
  year?: number;
  userRating?: number;
}

export interface CreateReviewPayload {
  movieId: string;
  text: string;
  watchedAt?: string;
}

export interface UpdateReviewPayload {
  text: string;
  watchedAt?: string;
}

export interface CreateListPayload {
  name: string;
  description?: string;
  isNumbered?: boolean;
  isRanked?: boolean;
}

export type UpdateListPayload = Partial<CreateListPayload>;

export interface GetMoviesParams {
  search?: string;
  watched?: boolean;
  year?: number;
  director?: string;
  genre?: string;
  listId?: string;
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

export interface TmdbResult {
  id: number;
  title: string;
  posterPath: string | null;
  year: number | null;
  overview: string;
  rating: number;
}

// ─── Auth Session ────────────────────────────────────────────────────────────

export interface AppSession {
  user: User;
  accessToken: string;
}

export const REVIEW_EDIT_WINDOW_MS = 24 * 60 * 60 * 1000;

export function canEditReview(createdAt: string): boolean {
  return Date.now() - new Date(createdAt).getTime() <= REVIEW_EDIT_WINDOW_MS;
}
