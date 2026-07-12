export type WatchedFilterParam = "all" | "unwatched" | "watched";

export interface GridUrlState {
  page: number;
  search: string;
  watched: WatchedFilterParam;
  director: string;
  genre: string;
}

export function parseGridUrlState(searchParams: URLSearchParams): GridUrlState {
  const rawPage = parseInt(searchParams.get("page") ?? "1", 10);
  const watched = searchParams.get("watched");

  return {
    page: Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1,
    search: searchParams.get("q") ?? "",
    watched:
      watched === "watched" || watched === "unwatched" ? watched : "all",
    director: searchParams.get("director") ?? "",
    genre: searchParams.get("genre") ?? "",
  };
}

export function buildGridQueryString(state: GridUrlState): string {
  const params = new URLSearchParams();

  if (state.page > 1) params.set("page", String(state.page));
  if (state.search.trim()) params.set("q", state.search.trim());
  if (state.watched !== "all") params.set("watched", state.watched);
  if (state.director.trim()) params.set("director", state.director.trim());
  if (state.genre.trim()) params.set("genre", state.genre.trim());

  return params.toString();
}

export function buildReturnPath(pathname: string, searchParams: URLSearchParams): string {
  const qs = searchParams.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}

export function isSafeReturnPath(path: string): boolean {
  if (!path.startsWith("/") || path.startsWith("//")) return false;

  const pathname = path.split("?")[0] ?? path;
  return (
    pathname === "/dashboard" ||
    pathname === "/profile" ||
    pathname === "/watched" ||
    pathname.startsWith("/lists/")
  );
}

export function getBackHref(from: string | null | undefined, fallback = "/dashboard"): string {
  if (from && isSafeReturnPath(from)) return from;
  return fallback;
}

export function buildMovieDetailHref(movieId: string, returnPath?: string): string {
  if (!returnPath || !isSafeReturnPath(returnPath)) {
    return `/movies/${movieId}`;
  }
  return `/movies/${movieId}?from=${encodeURIComponent(returnPath)}`;
}
