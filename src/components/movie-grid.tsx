"use client";

import { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, Filter, X, SlidersHorizontal } from "lucide-react";
import { useSession } from "next-auth/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MovieCard } from "@/components/movie-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getMovies } from "@/lib/api";
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

type WatchedFilter = "all" | "unwatched" | "watched";

const WATCHED_LABELS: Record<WatchedFilter, string> = {
  all: "Todos",
  unwatched: "Não assistidos",
  watched: "Assistidos",
};

interface MovieGridProps {
  /** Resposta do servidor (data, meta, watched, unwatched) para primeiro paint */
  initialData?: GetMoviesResponse | null;
}

function getDisplayList(res: GetMoviesResponse | undefined, filter: WatchedFilter): Movie[] {
  if (!res) return [];
  if (filter === "watched") return res.watched ?? [];
  if (filter === "unwatched") return res.unwatched ?? [];
  return res.data ?? [];
}

export function MovieGrid({ initialData: initialDataFromServer }: MovieGridProps) {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [watchedFilter, setWatchedFilter] = useState<WatchedFilter>("all");
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const params: GetMoviesParams = {
    page,
    limit: 24,
    ...(debouncedSearch && { search: debouncedSearch }),
  };

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["movies", params],
    queryFn: () => getMovies(params, session!.accessToken),
    enabled: !!session?.accessToken,
    placeholderData: (prev) => prev,
    initialData:
      !debouncedSearch && page === 1 && initialDataFromServer
        ? initialDataFromServer
        : undefined,
  });

  const movies = getDisplayList(data, watchedFilter);
  // #region agent log
  fetch('http://127.0.0.1:7315/ingest/91794988-f3a4-4423-a884-4d00087f0612',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'9dbbe4'},body:JSON.stringify({sessionId:'9dbbe4',location:'movie-grid.tsx:display',message:'Display list',data:{watchedFilter,watchedLen:data?.watched?.length,unwatchedLen:data?.unwatched?.length,moviesLen:movies.length,firstMovie:movies[0]?{id:movies[0].id,watched:movies[0].watched}:null},timestamp:Date.now(),hypothesisId:'H3'})}).catch(()=>{});
  // #endregion
  const totalPages = data?.meta?.totalPages ?? 1;
  const showPagination = watchedFilter === "all" && totalPages > 1;
  const displayCount =
    watchedFilter === "all" ? (data?.meta?.total ?? 0) : movies.length;

  const handleMovieDeleted = useCallback(
    (id: string) => {
      queryClient.invalidateQueries({ queryKey: ["movies"] });
    },
    [queryClient]
  );

  const handleMovieUpdated = useCallback(
    (_updated: Movie) => {
      queryClient.invalidateQueries({ queryKey: ["movies"] });
    },
    [queryClient]
  );

  const hasActiveFilters = watchedFilter !== "all" || debouncedSearch;

  return (
    <div className="space-y-6">
      {/* Barra de busca e filtros */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Buscar filmes..."
              className="pl-10 glass border-border focus-visible:border-primary/50 bg-transparent"
            />
            {search && (
              <button
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
            className={cn(
              "glass border-border",
              showFilters && "border-primary/50 text-primary"
            )}
          >
            <SlidersHorizontal className="size-4" />
          </Button>
        </div>

        {/* Filtros de status */}
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
                {(Object.keys(WATCHED_LABELS) as WatchedFilter[]).map((key) => (
                  <button
                    key={key}
                    onClick={() => {
                      setWatchedFilter(key);
                      setPage(1);
                    }}
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
            </motion.div>
          )}
        </AnimatePresence>

        {/* Contador e filtro ativo */}
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
              onClick={() => {
                setSearch("");
                setWatchedFilter("all");
                setPage(1);
              }}
            >
              <Filter className="size-3" />
              Limpar filtros
              <X className="size-3" />
            </Badge>
          )}
          {isFetching && !isLoading && (
            <span className="text-xs text-muted-foreground animate-pulse">
              Atualizando...
            </span>
          )}
        </div>
      </div>

      {/* Grid de filmes */}
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
              : "Sua lista está vazia. Adicione seu primeiro filme!"}
          </p>
        </motion.div>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4"
        >
          <AnimatePresence mode="popLayout">
            {movies.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                onDeleted={handleMovieDeleted}
                onUpdated={handleMovieUpdated}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Paginação (apenas para filtro "Todos") */}
      {showPagination && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="glass border-border"
          >
            Anterior
          </Button>
          <span className="text-sm text-muted-foreground">
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="glass border-border"
          >
            Próxima
          </Button>
        </div>
      )}
    </div>
  );
}
