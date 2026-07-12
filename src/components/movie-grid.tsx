"use client";

import { Suspense, useCallback, useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Filter, Search, SlidersHorizontal, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { backfillGenresAction } from "@/actions/movie-actions";
import { MovieCard } from "@/components/movie-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getMovies } from "@/lib/api";
import {
  buildGridQueryString,
  buildReturnPath,
  parseGridUrlState,
  type GridUrlState,
  type WatchedFilterParam,
} from "@/lib/grid-url-state";
import { ALL_GENRES_VALUE, TMDB_MOVIE_GENRES } from "@/lib/movie-genres";
import type { Movie, GetMoviesParams, GetMoviesResponse } from "@/lib/types";
import { cn } from "@/lib/utils";

function MovieCardSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="w-full rounded-2xl" style={{ aspectRatio: "2/3" }} />
      <Skeleton className="h-3 w-3/4 rounded" />
      <Skeleton className="h-3 w-1/3 rounded" />
    </div>
  );
}

const WATCHED_LABELS: Record<WatchedFilterParam, string> = {
  all: "Todos",
  unwatched: "Não assistidos",
  watched: "Assistidos",
};

interface MovieGridProps {
  initialData?: GetMoviesResponse | null;
  listId?: string;
}

function MovieGridInner({ initialData: initialDataFromServer, listId }: MovieGridProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const [isPending, startTransition] = useTransition();

  const urlState = parseGridUrlState(searchParams);
  const page = urlState.page;
  const watchedFilter = urlState.watched;

  const [search, setSearch] = useState(urlState.search);
  const [debouncedSearch, setDebouncedSearch] = useState(urlState.search);
  const [directorFilter, setDirectorFilter] = useState(urlState.director);
  const [genreFilter, setGenreFilter] = useState(urlState.genre);
  const [debouncedDirector, setDebouncedDirector] = useState(urlState.director);
  const [showFilters, setShowFilters] = useState(false);
  const backfillStartedRef = useRef(false);

  const returnPath = buildReturnPath(pathname, searchParams);

  useEffect(() => {
    backfillStartedRef.current = false;
  }, [genreFilter]);

  useEffect(() => {
    const parsed = parseGridUrlState(searchParams);
    setSearch(parsed.search);
    setDebouncedSearch(parsed.search);
    setDirectorFilter(parsed.director);
    setDebouncedDirector(parsed.director);
    setGenreFilter(parsed.genre);
  }, [searchParams]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedDirector(directorFilter), 400);
    return () => clearTimeout(timer);
  }, [directorFilter]);

  useEffect(() => {
    const parsed = parseGridUrlState(searchParams);
    const filtersChanged =
      debouncedSearch !== parsed.search ||
      debouncedDirector !== parsed.director ||
      genreFilter !== parsed.genre ||
      watchedFilter !== parsed.watched;

    const nextState: GridUrlState = {
      page: filtersChanged ? 1 : page,
      search: debouncedSearch,
      watched: watchedFilter,
      director: debouncedDirector,
      genre: genreFilter,
    };
    const nextQs = buildGridQueryString(nextState);
    const currentQs = searchParams.toString();

    if (nextQs === currentQs) return;

    const url = nextQs ? `${pathname}?${nextQs}` : pathname;
    router.replace(url, { scroll: false });
  }, [
    page,
    debouncedSearch,
    watchedFilter,
    debouncedDirector,
    genreFilter,
    pathname,
    router,
    searchParams,
  ]);

  function updatePage(nextPage: number) {
    const nextState: GridUrlState = {
      page: nextPage,
      search: debouncedSearch,
      watched: watchedFilter,
      director: debouncedDirector,
      genre: genreFilter,
    };
    const qs = buildGridQueryString(nextState);
    startTransition(() => {
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    });
  }

  function resetFilters() {
    setSearch("");
    setDebouncedSearch("");
    setDirectorFilter("");
    setDebouncedDirector("");
    setGenreFilter("");
    startTransition(() => {
      router.replace(pathname, { scroll: false });
    });
  }

  function setWatchedFilter(next: WatchedFilterParam) {
    const nextState: GridUrlState = {
      page: 1,
      search: debouncedSearch,
      watched: next,
      director: debouncedDirector,
      genre: genreFilter,
    };
    const qs = buildGridQueryString(nextState);
    startTransition(() => {
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    });
  }

  const params: GetMoviesParams = {
    page,
    limit: 24,
    ...(listId && { listId }),
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(debouncedDirector && { director: debouncedDirector }),
    ...(genreFilter && { genre: genreFilter }),
    ...(watchedFilter === "watched" && { watched: true }),
    ...(watchedFilter === "unwatched" && { watched: false }),
  };

  const hasFiltersInUrl =
    debouncedSearch || debouncedDirector || genreFilter || watchedFilter !== "all";

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["movies", params],
    queryFn: () => getMovies(params, session!.accessToken),
    enabled: !!session?.accessToken,
    placeholderData: (prev) => prev,
    initialData:
      page === 1 &&
      !hasFiltersInUrl &&
      initialDataFromServer
        ? initialDataFromServer
        : undefined,
  });

  const movies = data?.data ?? [];
  const totalPages = data?.meta?.totalPages ?? 1;
  const showPagination = totalPages > 1;
  const displayCount = data?.meta?.total ?? 0;

  useEffect(() => {
    if (!genreFilter || !session?.accessToken || isLoading || isFetching) return;
    if (backfillStartedRef.current) return;

    const libraryTotal =
      (data?.meta?.watchedTotal ?? 0) + (data?.meta?.unwatchedTotal ?? 0);
    const filteredTotal = data?.meta?.total ?? 0;

    if (filteredTotal > 0 || libraryTotal === 0) return;

    backfillStartedRef.current = true;
    const toastId = toast.loading("Sincronizando gêneros com TMDB...");

    backfillGenresAction()
      .then((result) => {
        if (result.updated > 0) {
          toast.success(`Gêneros atualizados em ${result.updated} filme(s)`, { id: toastId });
          queryClient.invalidateQueries({ queryKey: ["movies"] });
          router.refresh();
          return;
        }

        if (result.remaining > 0) {
          toast.info("Alguns filmes ainda não têm gênero na TMDB", { id: toastId });
          return;
        }

        toast.dismiss(toastId);
        backfillStartedRef.current = false;
      })
      .catch(() => {
        toast.error("Erro ao sincronizar gêneros", { id: toastId });
        backfillStartedRef.current = false;
      });
  }, [
    genreFilter,
    data?.meta?.total,
    data?.meta?.watchedTotal,
    data?.meta?.unwatchedTotal,
    isLoading,
    isFetching,
    session?.accessToken,
    queryClient,
    router,
  ]);

  const handleMovieDeleted = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["movies"] });
  }, [queryClient]);

  const handleMovieUpdated = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["movies"] });
  }, [queryClient]);

  const hasActiveFilters = hasFiltersInUrl;

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar filmes..."
              className="text-base pl-10 glass border-border focus-visible:border-primary/50 bg-transparent"
            />
            {search && (
              <button
                type="button"
                aria-label="Limpar busca"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
          <Button
            variant="outline"
            size="icon"
            aria-label="Filtros"
            onClick={() => setShowFilters((v) => !v)}
            className={cn("glass border-border", showFilters && "border-primary/50 text-primary")}
          >
            <SlidersHorizontal className="size-4" />
          </Button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="flex gap-2 flex-wrap pb-1">
                {(Object.keys(WATCHED_LABELS) as WatchedFilterParam[]).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setWatchedFilter(key)}
                    className={cn(
                      "px-3 py-1.5 rounded-full transition-all duration-200 border",
                      "font-sans text-xs font-medium",
                      watchedFilter === key
                        ? "bg-primary text-primary-foreground border-primary"
                        : "glass border-border text-muted-foreground hover:text-foreground hover:border-primary/40"
                    )}
                  >
                    {WATCHED_LABELS[key]}
                  </button>
                ))}
              </div>
              <div className="grid gap-3 sm:grid-cols-2 pt-2">
                <div className="space-y-1.5">
                  <label className="font-sans text-xs text-muted-foreground">Diretor</label>
                  <Input
                    value={directorFilter}
                    onChange={(e) => setDirectorFilter(e.target.value)}
                    placeholder="Filtrar por diretor..."
                    className="text-sm glass border-border bg-transparent h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-sans text-xs text-muted-foreground">Gênero</label>
                  <Select
                    value={genreFilter || ALL_GENRES_VALUE}
                    onValueChange={(value) =>
                      setGenreFilter(value === ALL_GENRES_VALUE ? "" : value)
                    }
                  >
                    <SelectTrigger className="w-full h-9 rounded-xl glass border-border bg-transparent text-sm">
                      <SelectValue placeholder="Todos os gêneros" />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-900 border-white/10 max-h-72">
                      <SelectItem value={ALL_GENRES_VALUE}>Todos os gêneros</SelectItem>
                      {TMDB_MOVIE_GENRES.map((genre) => (
                        <SelectItem key={genre} value={genre}>
                          {genre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-2">
          {(data?.meta != null || movies.length > 0) && (
            <span className="font-sans text-xs text-muted-foreground leading-relaxed">
              {displayCount} {displayCount === 1 ? "filme" : "filmes"}
            </span>
          )}
          {hasActiveFilters && (
            <Badge
              variant="secondary"
              className="flex items-center gap-1 cursor-pointer hover:bg-destructive/20"
              onClick={resetFilters}
            >
              <Filter className="size-3" />
              Limpar filtros
              <X className="size-3" />
            </Badge>
          )}
          {isFetching && !isLoading && (
            <span className="text-xs text-muted-foreground animate-pulse">Atualizando...</span>
          )}
        </div>
      </div>

      {showPagination && (
        <PaginationBar
          page={page}
          totalPages={totalPages}
          isPending={isPending}
          onPrevious={() => updatePage(Math.max(1, page - 1))}
          onNext={() => updatePage(Math.min(totalPages, page + 1))}
        />
      )}

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <MovieCardSkeleton key={i} />
          ))}
        </div>
      ) : movies.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-24 gap-4"
        >
          <span className="text-6xl">🎬</span>
          <p className="font-sans text-sm text-muted-foreground text-center leading-relaxed max-w-xs">
            {debouncedSearch
              ? `Nenhum filme encontrado para "${debouncedSearch}"`
              : hasActiveFilters
                ? "Nenhum filme encontrado com esses filtros."
                : "Sua lista está vazia. Adicione seu primeiro filme!"}
          </p>
        </motion.div>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4"
        >
          <AnimatePresence mode="popLayout">
            {movies.map((movie, index) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                listId={listId}
                returnPath={returnPath}
                onDeleted={handleMovieDeleted}
                onUpdated={handleMovieUpdated}
                priority={index < 8}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {showPagination && (
        <PaginationBar
          page={page}
          totalPages={totalPages}
          isPending={isPending}
          onPrevious={() => updatePage(Math.max(1, page - 1))}
          onNext={() => updatePage(Math.min(totalPages, page + 1))}
        />
      )}
    </div>
  );
}

interface PaginationBarProps {
  page: number;
  totalPages: number;
  isPending: boolean;
  onPrevious: () => void;
  onNext: () => void;
}

function PaginationBar({
  page,
  totalPages,
  isPending,
  onPrevious,
  onNext,
}: PaginationBarProps) {
  return (
    <div className="flex items-center justify-center gap-2 py-2">
      <Button
        variant="outline"
        size="sm"
        disabled={page === 1 || isPending}
        onClick={onPrevious}
        className="glass border-border"
      >
        Anterior
      </Button>
      <span className="text-sm text-muted-foreground min-w-18 text-center">
        {page} / {totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        disabled={page === totalPages || isPending}
        onClick={onNext}
        className="glass border-border"
      >
        Próxima
      </Button>
    </div>
  );
}

function MovieGridFallback() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <MovieCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function MovieGrid(props: MovieGridProps) {
  return (
    <Suspense fallback={<MovieGridFallback />}>
      <MovieGridInner {...props} />
    </Suspense>
  );
}
