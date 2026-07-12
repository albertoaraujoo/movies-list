"use client";

import { useState } from "react";
import Image from "next/image";
import { Film, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { getMovies, getDrawnMovies } from "@/lib/api";
import { getTmdbPosterUrl } from "@/lib/tmdb-images";
import type { Movie } from "@/lib/types";
import { cn } from "@/lib/utils";

interface MovieListPickerProps {
  open: boolean;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function MovieListPicker({ open, selectedId, onSelect }: MovieListPickerProps) {
  const { data: session } = useSession();
  const [listPage, setListPage] = useState(1);
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) setListPage(1);
  }

  const { data: moviesRes, isLoading } = useQuery({
    queryKey: ["movies", "for-drawn", listPage],
    queryFn: () => getMovies({ page: listPage, limit: 24 }, session!.accessToken!),
    enabled: open && !!session?.accessToken,
  });

  const { data: drawnList } = useQuery({
    queryKey: ["drawn-movies"],
    queryFn: () => getDrawnMovies(session!.accessToken!),
    enabled: open && !!session?.accessToken,
  });

  const drawnIds = new Set((drawnList ?? []).map((d) => d.movie.id));
  const pageMovies: Movie[] = moviesRes?.data ?? [];
  const available = pageMovies.filter((m) => !drawnIds.has(m.id));
  const totalPages = moviesRes?.meta?.totalPages ?? 1;
  const hasPagination = totalPages > 1;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Carregando filmes...
      </div>
    );
  }

  if (available.length === 0) {
    return (
      <p className="font-sans text-sm text-muted-foreground py-4">
        Todos os seus filmes já estão na lista ou a lista está vazia.
      </p>
    );
  }

  return (
    <>
      <div className="max-h-64 overflow-y-auto space-y-1 pr-1">
        {available.map((movie) => (
          <button
            key={movie.id}
            type="button"
            onClick={() => onSelect(movie.id)}
            className={cn(
              "w-full flex items-center gap-3 p-2 rounded-lg border text-left transition-colors",
              selectedId === movie.id
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/40"
            )}
          >
            <div className="relative w-8 h-12 rounded overflow-hidden bg-surface-raised shrink-0">
              {movie.posterPath ? (
                <Image
                  src={getTmdbPosterUrl(movie.posterPath, "w300") ?? movie.posterPath}
                  alt=""
                  fill
                  sizes="32px"
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Film className="size-4 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-sans text-sm font-medium text-foreground truncate">
                {movie.title}
              </p>
              {movie.year && (
                <p className="font-sans text-xs text-muted-foreground">
                  {movie.year}
                </p>
              )}
            </div>
          </button>
        ))}
      </div>

      {hasPagination && (
        <div className="flex items-center justify-center gap-2 pt-2 border-t border-border mt-2">
          <button
            type="button"
            onClick={() => {
              onSelect("");
              setListPage((p) => Math.max(1, p - 1));
            }}
            disabled={listPage <= 1}
            className="p-1.5 rounded-lg border border-border disabled:opacity-50 hover:bg-white/5"
            aria-label="Página anterior"
          >
            <ChevronLeft className="size-4" />
          </button>
          <span className="font-sans text-sm text-muted-foreground">
            {listPage} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => {
              onSelect("");
              setListPage((p) => Math.min(totalPages, p + 1));
            }}
            disabled={listPage >= totalPages}
            className="p-1.5 rounded-lg border border-border disabled:opacity-50 hover:bg-white/5"
            aria-label="Próxima página"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      )}
    </>
  );
}
