"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { Plus, Film, Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MovieSearchAutocomplete } from "@/components/movie-search-autocomplete";
import { createMovieAction } from "@/actions/movie-actions";
import type { Movie } from "@/lib/types";
import { cn } from "@/lib/utils";

interface TmdbResult {
  id: number;
  title: string;
  posterPath: string | null;
  year: number | null;
  overview: string;
  rating: number;
}

interface AddMovieDialogProps {
  onAdded?: (movie: Movie) => void;
}

export function AddMovieDialog({ onAdded }: AddMovieDialogProps) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [selectedTmdb, setSelectedTmdb] = useState<TmdbResult | null>(null);
  const [manualTitle, setManualTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [mode, setMode] = useState<"tmdb" | "manual">("tmdb");

  function resetForm() {
    setSelectedTmdb(null);
    setManualTitle("");
    setNotes("");
    setMode("tmdb");
  }

  function handleOpenChange(v: boolean) {
    setOpen(v);
    if (!v) resetForm();
  }

  function handleTmdbSelect(movie: TmdbResult) {
    setSelectedTmdb(movie);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const title = mode === "tmdb" ? selectedTmdb?.title : manualTitle;

    if (!title?.trim()) {
      toast.error("Informe o título do filme");
      return;
    }

    startTransition(async () => {
      try {
        const movie = await createMovieAction({
          title: title.trim(),
          notes: notes.trim() || undefined,
          tmdbId: mode === "tmdb" ? selectedTmdb?.id : undefined,
          year: mode === "tmdb" ? (selectedTmdb?.year ?? undefined) : undefined,
        });
        toast.success("Filme adicionado!", {
          description: movie.title,
          icon: "🎬",
        });
        queryClient.invalidateQueries({ queryKey: ["movies"] });
        onAdded?.(movie);
        setOpen(false);
        resetForm();
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Erro ao adicionar filme";
        toast.error(msg);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2 bg-primary text-primary-foreground hover:brightness-110">
          <Plus className="size-4" />
          <span>Adicionar Filme</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="border-border bg-background sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display tracking-wider uppercase text-xl leading-none">
            <Film className="size-5 text-gold shrink-0" />
            Adicionar Filme
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-2">
          {/* Toggle de modo */}
          <div className="flex p-1 rounded-xl glass border border-border gap-1">
            {(["tmdb", "manual"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={cn(
                  "flex-1 py-1.5 rounded-lg text-sm font-medium transition-all duration-200",
                  mode === m
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {m === "tmdb" ? "🔍 Buscar no TMDB" : "✏️ Manual"}
              </button>
            ))}
          </div>

          {/* Campo de busca/título */}
          {mode === "tmdb" ? (
            <div className="space-y-2">
              <label className="font-sans text-sm text-muted-foreground font-medium">
                Buscar filme
              </label>
              <MovieSearchAutocomplete
                onSelect={handleTmdbSelect}
                placeholder="Digite o nome do filme..."
              />
              {selectedTmdb && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="flex items-center gap-3 p-3 rounded-xl glass border border-primary/20"
                >
                  <span className="text-2xl">✅</span>
                  <div>
                    <p className="font-display tracking-wider uppercase text-sm leading-tight">{selectedTmdb.title}</p>
                    {selectedTmdb.year && (
                      <p className="font-sans text-xs text-muted-foreground leading-relaxed">{selectedTmdb.year}</p>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <label htmlFor="title" className="font-sans text-sm text-muted-foreground font-medium">
                Título do filme
              </label>
              <Input
                id="title"
                value={manualTitle}
                onChange={(e) => setManualTitle(e.target.value)}
                placeholder="Ex: Interestelar"
                className="glass border-border focus-visible:border-primary/50 bg-transparent"
              />
            </div>
          )}

          {/* Notas */}
          <div className="space-y-2">
            <label htmlFor="notes" className="text-sm text-muted-foreground font-medium">
              Notas{" "}
              <span className="text-xs opacity-60">(opcional)</span>
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Indicação, onde assistir, lembrete..."
              rows={3}
              className={cn(
                "w-full px-3 py-2.5 rounded-xl text-sm resize-none",
                "glass border border-border",
                "text-foreground placeholder:text-muted-foreground",
                "focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20",
                "transition-all duration-200"
              )}
            />
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1 glass border-border"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isPending || (mode === "tmdb" && !selectedTmdb) || (mode === "manual" && !manualTitle.trim())}
              className="flex-1 bg-primary text-primary-foreground hover:brightness-110"
            >
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Adicionando...
                </>
              ) : (
                <>
                  <Plus className="size-4" />
                  Adicionar
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
