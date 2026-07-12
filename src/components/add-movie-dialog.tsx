"use client";

import { useEffect, useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Film, Layers, Loader2, Plus, X } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
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
import { LibraryMovieSearch } from "@/components/library-movie-search";
import { bulkCreateMoviesAction } from "@/actions/movie-actions";
import { addMoviesToListsAction } from "@/actions/list-actions";
import { getLists } from "@/lib/api";
import type { CreateMoviePayload, Movie, TmdbResult } from "@/lib/types";
import { cn, getErrorMessage } from "@/lib/utils";

const MAX_QUEUE = 10;

interface QueuedMovie {
  id: string;
  title: string;
  movieId?: string;
  tmdbId?: number;
  year?: number;
}

interface AddMovieDialogProps {
  onAdded?: (movie: Movie) => void;
  defaultListIds?: string[];
  fixedListIds?: string[];
  excludeMovieIds?: string[];
  dialogTitle?: string;
  submitLabel?: string;
  trigger?: ReactNode;
}

export function AddMovieDialog({
  onAdded,
  defaultListIds = [],
  fixedListIds = [],
  excludeMovieIds = [],
  dialogTitle = "Adicionar Filmes",
  submitLabel = "Adicionar às listas",
  trigger,
}: AddMovieDialogProps) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [manualTitle, setManualTitle] = useState("");
  const [mode, setMode] = useState<"tmdb" | "manual" | "library">("tmdb");
  const [queue, setQueue] = useState<QueuedMovie[]>([]);
  const [selectedListIds, setSelectedListIds] = useState<string[]>([]);
  const [searchKey, setSearchKey] = useState(0);

  const isListLocked = fixedListIds.length > 0;
  const targetListIds = isListLocked ? fixedListIds : selectedListIds;

  const {
    data: lists = [],
    isLoading: isLoadingLists,
    isError: isListsError,
    refetch: refetchLists,
  } = useQuery({
    queryKey: ["lists"],
    queryFn: () => getLists(session!.accessToken),
    enabled: !!session?.accessToken && open && !isListLocked,
  });

  useEffect(() => {
    if (!open) return;

    if (fixedListIds.length > 0) {
      setSelectedListIds(fixedListIds);
      return;
    }

    if (defaultListIds.length > 0) {
      setSelectedListIds(defaultListIds);
      return;
    }

    if (lists.length > 0 && selectedListIds.length === 0) {
      const defaultList = lists.find((list) => list.isDefault);
      if (defaultList) setSelectedListIds([defaultList.id]);
    }
  }, [open, lists, defaultListIds, fixedListIds, selectedListIds.length]);

  function resetForm() {
    setManualTitle("");
    setMode("tmdb");
    setQueue([]);
    setSearchKey((k) => k + 1);
    setSelectedListIds(fixedListIds.length > 0 ? fixedListIds : defaultListIds);
  }

  function handleOpenChange(v: boolean) {
    setOpen(v);
    if (!v) resetForm();
  }

  function isInQueue(item: { title: string; movieId?: string; tmdbId?: number }) {
    return queue.some(
      (q) =>
        (item.movieId && q.movieId === item.movieId) ||
        (item.tmdbId != null && q.tmdbId === item.tmdbId) ||
        q.title.toLowerCase() === item.title.toLowerCase()
    );
  }

  function enqueue(item: Omit<QueuedMovie, "id">) {
    if (queue.length >= MAX_QUEUE) {
      toast.error(`Máximo de ${MAX_QUEUE} filmes por vez`);
      return false;
    }
    if (item.movieId && excludeMovieIds.includes(item.movieId)) {
      toast.error("Este filme já está nesta lista");
      return false;
    }
    if (isInQueue(item)) {
      toast.error("Filme já está na fila");
      return false;
    }

    setQueue((prev) => [...prev, { ...item, id: crypto.randomUUID() }]);
    setSearchKey((k) => k + 1);
    return true;
  }

  function handleTmdbSelect(movie: TmdbResult) {
    enqueue({
      title: movie.title,
      tmdbId: movie.id,
      year: movie.year ?? undefined,
    });
  }

  function handleLibrarySelect(movie: Movie) {
    enqueue({
      title: movie.title,
      movieId: movie.id,
      year: movie.year ?? undefined,
      tmdbId: movie.tmdbId ?? undefined,
    });
  }

  function addManualToQueue() {
    if (!manualTitle.trim()) {
      toast.error("Informe o título do filme");
      return;
    }
    if (
      enqueue({
        title: manualTitle.trim(),
      })
    ) {
      setManualTitle("");
    }
  }

  function removeFromQueue(id: string) {
    setQueue((prev) => prev.filter((q) => q.id !== id));
  }

  function toggleList(listId: string) {
    if (isListLocked) return;
    setSelectedListIds((prev) =>
      prev.includes(listId) ? prev.filter((id) => id !== listId) : [...prev, listId]
    );
  }

  function handleBulkSubmit() {
    if (queue.length === 0) {
      toast.error("Adicione pelo menos um filme à fila");
      return;
    }
    if (targetListIds.length === 0) {
      toast.error("Selecione pelo menos uma lista");
      return;
    }

    const newMovies = queue.filter((q) => !q.movieId);
    const existingMovieIds = queue.filter((q) => q.movieId).map((q) => q.movieId!);

    startTransition(async () => {
      try {
        let createdCount = 0;

        if (newMovies.length > 0) {
          const movies: CreateMoviePayload[] = newMovies.map((q) => ({
            title: q.title,
            tmdbId: q.tmdbId,
            year: q.year,
          }));
          const created = await bulkCreateMoviesAction({
            movies,
            listIds: targetListIds,
          });
          createdCount += created.length;
          if (created[0]) onAdded?.(created[0]);
        }

        if (existingMovieIds.length > 0) {
          await addMoviesToListsAction(existingMovieIds, targetListIds);
          createdCount += existingMovieIds.length;
        }

        toast.success(`${createdCount} filme(s) adicionado(s)!`, { icon: "🎬" });
        queryClient.invalidateQueries({ queryKey: ["movies"] });
        queryClient.invalidateQueries({ queryKey: ["lists"] });
        router.refresh();
        setOpen(false);
        resetForm();
      } catch (err) {
        toast.error(getErrorMessage(err, "Erro ao adicionar filmes"));
      }
    });
  }

  const selectableLists = lists.filter((list) => !list.isFavorites);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button className="flex items-center gap-2 bg-primary text-primary-foreground hover:brightness-110">
            <Plus className="size-4" />
            <span>Adicionar Filme</span>
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="border-border bg-neutral-900 shadow-2xl sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display tracking-wider uppercase text-xl leading-none">
            <Film className="size-5 text-gold shrink-0" />
            {dialogTitle}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          <div className="flex p-1 rounded-xl border border-border bg-neutral-950 gap-1">
            {(
              [
                { key: "tmdb", label: "🔍 TMDB" },
                { key: "library", label: "📚 Biblioteca" },
                { key: "manual", label: "✏️ Manual" },
              ] as const
            ).map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setMode(key)}
                className={cn(
                  "flex-1 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200",
                  mode === key
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {mode === "tmdb" ? (
            <div className="space-y-2">
              <label className="font-sans text-sm text-muted-foreground font-medium">
                Buscar filme
              </label>
              <MovieSearchAutocomplete
                key={`tmdb-${searchKey}`}
                onSelect={handleTmdbSelect}
                placeholder="Digite e clique no resultado para enfileirar..."
              />
              <p className="font-sans text-xs text-muted-foreground">
                Clique no resultado para adicionar à fila automaticamente
              </p>
            </div>
          ) : mode === "library" ? (
            <div className="space-y-2">
              <label className="font-sans text-sm text-muted-foreground font-medium">
                Buscar na sua biblioteca
              </label>
              <LibraryMovieSearch
                key={`lib-${searchKey}`}
                onSelect={handleLibrarySelect}
                excludeMovieIds={excludeMovieIds}
                placeholder="Digite e clique no resultado para enfileirar..."
              />
              <p className="font-sans text-xs text-muted-foreground">
                Clique no resultado para adicionar à fila automaticamente
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <label htmlFor="title" className="font-sans text-sm text-muted-foreground font-medium">
                Título do filme
              </label>
              <div className="flex gap-2">
                <Input
                  id="title"
                  value={manualTitle}
                  onChange={(e) => setManualTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addManualToQueue();
                    }
                  }}
                  placeholder="Ex: Interestelar"
                  className="text-base border-border bg-neutral-950 focus-visible:border-primary/50"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={addManualToQueue}
                  disabled={!manualTitle.trim() || queue.length >= MAX_QUEUE}
                  className="shrink-0 border-border bg-neutral-950"
                >
                  <Plus className="size-4" />
                </Button>
              </div>
            </div>
          )}

          <AnimatePresence>
            {queue.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
              >
                <p className="font-sans text-xs text-muted-foreground uppercase tracking-wider">
                  Fila ({queue.length}/{MAX_QUEUE})
                </p>
                <div className="flex flex-wrap gap-2">
                  {queue.map((item) => (
                    <span
                      key={item.id}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-surface-raised border border-border"
                    >
                      <span className="truncate max-w-[140px]">{item.title}</span>
                      {item.movieId && (
                        <span className="text-[10px] text-muted-foreground">bib.</span>
                      )}
                      <button
                        type="button"
                        aria-label={`Remover ${item.title}`}
                        onClick={() => removeFromQueue(item.id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="size-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!isListLocked && (
            <div className="space-y-2">
              <p className="font-sans text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="size-3.5" />
                Listas destino
              </p>

              {isLoadingLists ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                  <Loader2 className="size-4 animate-spin" />
                  Carregando listas...
                </div>
              ) : isListsError ? (
                <div className="flex items-center justify-between gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2">
                  <span className="flex items-center gap-2 text-xs text-destructive">
                    <AlertCircle className="size-3.5 shrink-0" />
                    Erro ao carregar listas
                  </span>
                  <Button type="button" variant="ghost" size="sm" onClick={() => refetchLists()}>
                    Tentar novamente
                  </Button>
                </div>
              ) : selectableLists.length === 0 ? (
                <p className="text-xs text-muted-foreground">Nenhuma lista disponível.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {selectableLists.map((list) => (
                    <button
                      key={list.id}
                      type="button"
                      onClick={() => toggleList(list.id)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                        selectedListIds.includes(list.id)
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border bg-neutral-950 text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {list.name}
                      {list.isDefault && " ★"}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1 border-border bg-neutral-950"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleBulkSubmit}
              disabled={isPending || queue.length === 0 || targetListIds.length === 0}
              className="flex-1 bg-primary text-primary-foreground hover:brightness-110 gap-2"
            >
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Adicionando...
                </>
              ) : (
                <>
                  <Plus className="size-4" />
                  {submitLabel}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
