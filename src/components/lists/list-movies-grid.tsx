"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpDown, Filter, Search, SlidersHorizontal, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { reorderListAction } from "@/actions/list-actions";
import { MovieCard } from "@/components/movie-card";
import { ListRankedRow } from "@/components/lists/list-ranked-row";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ALL_GENRES_VALUE, movieMatchesGenre, TMDB_MOVIE_GENRES } from "@/lib/movie-genres";
import type { Movie, MovieList, MovieListItem } from "@/lib/types";
import { cn } from "@/lib/utils";

type WatchedFilter = "all" | "unwatched" | "watched";

const WATCHED_LABELS: Record<WatchedFilter, string> = {
  all: "Todos",
  unwatched: "Não assistidos",
  watched: "Assistidos",
};

interface ListItemEntry {
  item: MovieListItem;
  rank: number;
}

interface ListMoviesGridProps {
  list: MovieList;
}

function matchesSearch(movie: Movie, search: string): boolean {
  const q = search.trim().toLowerCase();
  if (!q) return true;
  return (
    movie.title.toLowerCase().includes(q) ||
    (movie.director?.toLowerCase().includes(q) ?? false) ||
    (movie.notes?.toLowerCase().includes(q) ?? false)
  );
}

function filterEntries(
  entries: ListItemEntry[],
  {
    search,
    watchedFilter,
    director,
    genre,
  }: {
    search: string;
    watchedFilter: WatchedFilter;
    director: string;
    genre: string;
  }
): ListItemEntry[] {
  const directorQ = director.trim().toLowerCase();

  return entries.filter(({ item }) => {
    const movie = item.movie;
    if (!matchesSearch(movie, search)) return false;
    if (watchedFilter === "watched" && !movie.watched) return false;
    if (watchedFilter === "unwatched" && movie.watched) return false;
    if (directorQ && !(movie.director?.toLowerCase().includes(directorQ) ?? false)) return false;
    if (genre && !movieMatchesGenre(movie.genres, genre)) return false;
    return true;
  });
}

export function ListMoviesGrid({ list }: ListMoviesGridProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [entries, setEntries] = useState<ListItemEntry[]>(() =>
    (list.items ?? []).map((item, index) => ({ item, rank: index + 1 }))
  );
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [watchedFilter, setWatchedFilter] = useState<WatchedFilter>("all");
  const [directorFilter, setDirectorFilter] = useState("");
  const [genreFilter, setGenreFilter] = useState("");
  const [debouncedDirector, setDebouncedDirector] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [isReordering, setIsReordering] = useState(false);

  useEffect(() => {
    setEntries((list.items ?? []).map((item, index) => ({ item, rank: index + 1 })));
  }, [list.items]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedDirector(directorFilter), 400);
    return () => clearTimeout(timer);
  }, [directorFilter]);

  const filteredEntries = useMemo(
    () =>
      filterEntries(entries, {
        search: debouncedSearch,
        watchedFilter,
        director: debouncedDirector,
        genre: genreFilter,
      }),
    [entries, debouncedSearch, watchedFilter, debouncedDirector, genreFilter]
  );

  const hasActiveFilters =
    watchedFilter !== "all" || debouncedSearch || debouncedDirector || genreFilter;

  const handleMovieUpdated = useCallback(
    (updated: Movie) => {
      setEntries((prev) =>
        prev.map((entry) =>
          entry.item.movie.id === updated.id
            ? {
                ...entry,
                item: {
                  ...entry.item,
                  movie: { ...entry.item.movie, ...updated, watched: updated.watched },
                },
              }
            : entry
        )
      );
      router.refresh();
    },
    [router]
  );

  const handleRemovedFromList = useCallback(
    (movieId: string) => {
      setEntries((prev) =>
        prev
          .filter(({ item }) => item.movie.id !== movieId)
          .map((entry, index) => ({ ...entry, rank: index + 1 }))
      );
      router.refresh();
    },
    [router]
  );

  const showRank = list.isNumbered || list.isRanked;
  const returnPath = `/lists/${list.id}`;
  const canReorder = showRank && !hasActiveFilters && entries.length > 1;

  const handleMoveEntry = useCallback(
    (index: number, direction: "up" | "down") => {
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= entries.length) return;

      const previousEntries = entries;
      const nextEntries = [...entries];
      [nextEntries[index], nextEntries[targetIndex]] = [
        nextEntries[targetIndex],
        nextEntries[index],
      ];
      const reordered = nextEntries.map((entry, i) => ({ ...entry, rank: i + 1 }));

      setEntries(reordered);
      setIsReordering(true);

      startTransition(async () => {
        try {
          await reorderListAction(
            list.id,
            reordered.map(({ item }) => item.movie.id)
          );
          router.refresh();
        } catch {
          setEntries(previousEntries);
          toast.error("Erro ao reordenar a lista");
        } finally {
          setIsReordering(false);
        }
      });
    },
    [entries, list.id, router]
  );

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar filmes nesta lista..."
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
                {(Object.keys(WATCHED_LABELS) as WatchedFilter[]).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => startTransition(() => setWatchedFilter(key))}
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
          <span className="font-sans text-xs text-muted-foreground leading-relaxed">
            {filteredEntries.length}{" "}
            {filteredEntries.length === 1 ? "filme" : "filmes"}
            {entries.length !== filteredEntries.length && ` de ${entries.length}`}
          </span>
          {hasActiveFilters && (
            <Badge
              variant="secondary"
              className="flex items-center gap-1 cursor-pointer hover:bg-destructive/20"
              onClick={() => {
                startTransition(() => {
                  setSearch("");
                  setWatchedFilter("all");
                  setDirectorFilter("");
                  setGenreFilter("");
                });
              }}
            >
              <Filter className="size-3" />
              Limpar filtros
              <X className="size-3" />
            </Badge>
          )}
          {showRank && hasActiveFilters && entries.length > 0 && (
            <span className="font-sans text-xs text-muted-foreground">
              Limpe os filtros para reordenar
            </span>
          )}
        </div>
        {canReorder && (
          <p className="flex items-center gap-1.5 font-sans text-xs text-muted-foreground">
            <ArrowUpDown className="size-3.5" />
            Use as setas para alterar a posição dos filmes
          </p>
        )}
      </div>

      {filteredEntries.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-24 gap-4 rounded-2xl border border-dashed border-border"
        >
          <span className="text-6xl">🎬</span>
          <p className="font-sans text-sm text-muted-foreground text-center leading-relaxed max-w-xs">
            {entries.length === 0
              ? "Esta lista está vazia."
              : debouncedSearch
                ? `Nenhum filme encontrado para "${debouncedSearch}"`
                : "Nenhum filme corresponde aos filtros selecionados."}
          </p>
        </motion.div>
      ) : canReorder ? (
        <motion.div layout className="flex flex-col gap-2 sm:gap-3">
          <AnimatePresence mode="popLayout">
            {entries.map(({ item, rank }, index) => (
              <ListRankedRow
                key={item.id}
                movie={item.movie}
                rank={rank}
                listId={list.id}
                returnPath={returnPath}
                canMoveUp={index > 0}
                canMoveDown={index < entries.length - 1}
                isReordering={isReordering}
                onMoveUp={() => handleMoveEntry(index, "up")}
                onMoveDown={() => handleMoveEntry(index, "down")}
                onUpdated={handleMovieUpdated}
                onRemovedFromList={handleRemovedFromList}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4"
        >
          <AnimatePresence mode="popLayout">
            {filteredEntries.map(({ item, rank }, index) => (
              <MovieCard
                key={item.id}
                movie={item.movie}
                listId={list.id}
                listRank={showRank ? rank : undefined}
                returnPath={returnPath}
                onUpdated={handleMovieUpdated}
                onRemovedFromList={handleRemovedFromList}
                priority={index < 8}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
