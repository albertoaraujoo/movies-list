"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { Film, Loader2, List, Search } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getMovies, getDrawnMovies } from "@/lib/api";
import { addMovieToDrawnAction, addMovieToDrawnFromTmdbAction } from "@/actions/movie-actions";
import { MovieSearchAutocomplete } from "@/components/movie-search-autocomplete";
import type { Movie } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";

interface TmdbResult {
  id: number;
  title: string;
  posterPath: string | null;
  year: number | null;
  overview: string;
  rating: number;
}

interface AddToDrawnModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type AddMode = "list" | "tmdb";

export function AddToDrawnModal({ open, onOpenChange }: AddToDrawnModalProps) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [isPending, startTransition] = useTransition();
  const [mode, setMode] = useState<AddMode>("list");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedTmdb, setSelectedTmdb] = useState<TmdbResult | null>(null);

  const { data: moviesRes, isLoading: loadingMovies } = useQuery({
    queryKey: ["movies", "for-drawn"],
    queryFn: () => getMovies({ page: 1, limit: 200 }, session!.accessToken!),
    enabled: open && !!session?.accessToken,
  });

  const { data: drawnList } = useQuery({
    queryKey: ["drawn-movies"],
    queryFn: () => getDrawnMovies(session!.accessToken!),
    enabled: open && !!session?.accessToken,
  });

  const drawnIds = new Set((drawnList ?? []).map((d) => d.movie.id));
  const allMovies: Movie[] = [
    ...(moviesRes?.watched ?? []),
    ...(moviesRes?.unwatched ?? []),
  ];
  const uniqueMovies = allMovies.filter(
    (m, i, arr) => arr.findIndex((x) => x.id === m.id) === i
  );
  const available = uniqueMovies.filter((m) => !drawnIds.has(m.id));

  function handleAddFromList() {
    if (!selectedId) return;
    startTransition(async () => {
      try {
        await addMovieToDrawnAction(selectedId);
        queryClient.invalidateQueries({ queryKey: ["drawn-movies"] });
        toast.success("Filme adicionado à lista de sorteados");
        onOpenChange(false);
        setSelectedId(null);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Erro ao adicionar";
        if (msg.includes("já está") || msg.includes("lista cheia")) {
          toast.error(msg);
        } else {
          toast.error("Erro ao adicionar à lista de sorteados");
        }
      }
    });
  }

  function handleAddFromTmdb() {
    if (!selectedTmdb?.title?.trim()) {
      toast.error("Selecione um filme da busca");
      return;
    }
    startTransition(async () => {
      try {
        await addMovieToDrawnFromTmdbAction({
          title: selectedTmdb.title.trim(),
          tmdbId: selectedTmdb.id,
          year: selectedTmdb.year ?? undefined,
        });
        queryClient.invalidateQueries({ queryKey: ["drawn-movies"] });
        toast.success("Filme adicionado à lista de sorteados");
        onOpenChange(false);
        setSelectedTmdb(null);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Erro ao adicionar";
        if (msg.includes("lista cheia")) {
          toast.error(msg);
        } else {
          toast.error("Erro ao adicionar à lista de sorteados");
        }
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border bg-background shadow-lg sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display tracking-wider uppercase">
            Adicionar à lista de sorteados
          </DialogTitle>
        </DialogHeader>
        <div className="flex gap-2 border-b border-border pb-2">
          <button
            type="button"
            onClick={() => setMode("list")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-sans text-sm transition-colors",
              mode === "list"
                ? "bg-primary text-primary-foreground"
                : "border border-border text-muted-foreground hover:text-foreground"
            )}
          >
            <List className="size-4" />
            Da minha lista
          </button>
          <button
            type="button"
            onClick={() => setMode("tmdb")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-sans text-sm transition-colors",
              mode === "tmdb"
                ? "bg-primary text-primary-foreground"
                : "border border-border text-muted-foreground hover:text-foreground"
            )}
          >
            <Search className="size-4" />
            Buscar no TMDB
          </button>
        </div>
        {mode === "tmdb" ? (
          <>
            <p className="font-sans text-sm text-muted-foreground">
              Busque um filme e adicione direto à fila (máx. 30). O filme será criado e incluído nos sorteados.
            </p>
            <MovieSearchAutocomplete onSelect={setSelectedTmdb} />
            {selectedTmdb && (
              <div className="flex items-center justify-between gap-2 pt-2">
                <p className="font-sans text-sm text-foreground truncate">
                  {selectedTmdb.title}
                  {selectedTmdb.year != null && (
                    <span className="text-muted-foreground ml-1">({selectedTmdb.year})</span>
                  )}
                </p>
                <div className="flex gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setSelectedTmdb(null)}
                    className="px-3 py-1.5 rounded-lg border border-border font-sans text-sm hover:bg-white/5"
                  >
                    Limpar
                  </button>
                  <button
                    type="button"
                    onClick={handleAddFromTmdb}
                    disabled={isPending}
                    className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground font-sans text-sm font-medium disabled:opacity-50 flex items-center gap-2"
                  >
                    {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
                    Adicionar
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <p className="font-sans text-sm text-muted-foreground">
              Escolha um filme da sua lista para adicionar à fila de sorteados (máx. 30).
            </p>
            {loadingMovies ? (
          <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Carregando filmes...
          </div>
        ) : available.length === 0 ? (
          <p className="font-sans text-sm text-muted-foreground py-4">
            Todos os seus filmes já estão na lista ou a lista está vazia.
          </p>
        ) : (
          <div className="max-h-64 overflow-y-auto space-y-1 pr-1">
            {available.map((movie) => (
              <button
                key={movie.id}
                type="button"
                onClick={() => setSelectedId(movie.id)}
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
                      src={movie.posterPath}
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
        )}
            {available.length > 0 && (
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="px-3 py-1.5 rounded-lg border border-border font-sans text-sm hover:bg-white/5"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleAddFromList}
                  disabled={!selectedId || isPending}
                  className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground font-sans text-sm font-medium disabled:opacity-50 flex items-center gap-2"
                >
                  {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
                  Adicionar
                </button>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
