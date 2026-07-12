"use client";

import { useState, useTransition } from "react";
import { Loader2, List, Search } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { addMovieToDrawnAction, addMovieToDrawnFromTmdbAction } from "@/actions/movie-actions";
import { MovieSearchAutocomplete } from "@/components/movie-search-autocomplete";
import { MovieListPicker } from "@/components/movie-list-picker";
import type { TmdbResult } from "@/lib/types";
import { cn, getErrorMessage } from "@/lib/utils";

interface AddToDrawnModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type AddMode = "list" | "tmdb";

export function AddToDrawnModal({ open, onOpenChange }: AddToDrawnModalProps) {
  const queryClient = useQueryClient();
  const [isPending, startTransition] = useTransition();
  const [mode, setMode] = useState<AddMode>("list");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedTmdb, setSelectedTmdb] = useState<TmdbResult | null>(null);

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
        toast.error(getErrorMessage(err, "Erro ao adicionar"));
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
        toast.error(getErrorMessage(err, "Erro ao adicionar"));
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
            <MovieListPicker
              open={open}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
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
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
