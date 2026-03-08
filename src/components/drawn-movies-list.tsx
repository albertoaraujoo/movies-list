"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, Eye, Film } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { removeDrawnMovieAction, markWatchedAction } from "@/actions/movie-actions";
import { getDrawnMovies } from "@/lib/api";
import { getTmdbPosterUrl } from "@/lib/tmdb-images";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { DrawnMovie } from "@/lib/types";
import { cn } from "@/lib/utils";

function DrawnMovieSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl glass">
      <Skeleton className="w-10 h-14 rounded-lg shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3 w-3/4" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
  );
}

interface DrawnMoviesListProps {
  initialItems?: DrawnMovie[];
}

export function DrawnMoviesList({ initialItems }: DrawnMoviesListProps) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [isPending, startTransition] = useTransition();

  const { data: serverItems, isLoading } = useQuery({
    queryKey: ["drawn-movies"],
    queryFn: () => getDrawnMovies(session!.accessToken),
    enabled: !!session?.accessToken,
    initialData: initialItems,
    placeholderData: initialItems,
  });

  const [items, setItems] = useState<DrawnMovie[]>(initialItems ?? []);
  const [confirmRemove, setConfirmRemove] = useState<{ drawnId: string; title: string } | null>(null);
  const [confirmMarkWatched, setConfirmMarkWatched] = useState<{
    movieId: string;
    drawnId: string;
    title: string;
  } | null>(null);

  // Sincroniza com o servidor quando os dados chegam
  const displayItems = serverItems ?? items;

  function handleRemove(drawnId: string, title: string) {
    setConfirmRemove({ drawnId, title });
  }

  function handleConfirmRemove() {
    if (!confirmRemove) return;
    const { drawnId, title } = confirmRemove;
    setConfirmRemove(null);
    startTransition(async () => {
      try {
        await removeDrawnMovieAction(drawnId);
        queryClient.invalidateQueries({ queryKey: ["drawn-movies"] });
        toast.success("Removido da lista de sorteados", { description: title });
        setItems((prev) => prev.filter((i) => i.id !== drawnId));
      } catch {
        toast.error("Erro ao remover da lista");
      }
    });
  }

  function handleMarkWatched(movieId: string, drawnId: string, title: string) {
    setConfirmMarkWatched({ movieId, drawnId, title });
  }

  function handleConfirmMarkWatched() {
    if (!confirmMarkWatched) return;
    const { movieId, drawnId, title } = confirmMarkWatched;
    setConfirmMarkWatched(null);
    startTransition(async () => {
      try {
        await markWatchedAction(movieId, true);
        queryClient.invalidateQueries({ queryKey: ["drawn-movies"] });
        toast.success("Marcado como assistido!", { description: title, icon: "✅" });
        setItems((prev) => prev.filter((i) => i.id !== drawnId));
      } catch {
        toast.error("Erro ao marcar como assistido");
      }
    });
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <DrawnMovieSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (displayItems.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full flex flex-col items-center justify-center gap-3 py-16 text-center"
      >
        <span className="text-5xl">🎲</span>
        <p className="font-sans text-sm text-muted-foreground leading-relaxed max-w-xs">
          Nenhum filme sorteado ainda.
          <br />
          Clique em &quot;Sortear Filme&quot; para começar!
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
        <AnimatePresence initial={false}>
          {displayItems.map((item, index) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16, height: 0 }}
              transition={{ delay: index * 0.04, duration: 0.3 }}
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl",
                "glass border border-border",
                "hover:border-primary/20 transition-all duration-200",
                isPending && "opacity-50 pointer-events-none"
              )}
            >
              {/* Número de ordem */}
              <span className="font-display tracking-wide text-gold text-base w-5 text-center shrink-0">
                {index + 1}
              </span>

              {/* Poster */}
              <div className="relative w-10 h-14 rounded-lg overflow-hidden bg-surface-raised border border-border shrink-0">
                {item.movie.posterPath ? (
                  <Image
                    src={getTmdbPosterUrl(item.movie.posterPath, "w300") ?? item.movie.posterPath}
                    alt={item.movie.title}
                    fill
                    sizes="40px"
                    className="object-cover"
                    loading="lazy"
                    unoptimized
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Film className="size-3 text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 space-y-0.5">
                <p className="font-display tracking-wider uppercase text-[0.8rem] leading-tight text-foreground truncate">
                  {item.movie.title}
                </p>
                {item.movie.year && (
                  <p className="font-sans text-xs text-muted-foreground leading-relaxed">
                    {item.movie.year}
                  </p>
                )}
              </div>

              {/* Ações */}
              <div className="flex items-center gap-1 shrink-0">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label="Marcar como assistido"
                  onClick={() =>
                    handleMarkWatched(item.movie.id, item.id, item.movie.title)
                  }
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                >
                  <Eye className="size-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label="Remover da lista"
                  onClick={() => handleRemove(item.id, item.movie.title)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <X className="size-4" />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Modal: confirmar remoção */}
      <Dialog open={!!confirmRemove} onOpenChange={(open) => !open && setConfirmRemove(null)}>
        <DialogContent className="border-border bg-background sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Remover da lista de sorteados?</DialogTitle>
          </DialogHeader>
          <p className="font-sans text-sm text-muted-foreground">
            {confirmRemove?.title} será removido da lista. Você pode sortear novamente depois.
          </p>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setConfirmRemove(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleConfirmRemove} disabled={isPending}>
              Remover
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: confirmar marcar como assistido */}
      <Dialog open={!!confirmMarkWatched} onOpenChange={(open) => !open && setConfirmMarkWatched(null)}>
        <DialogContent className="border-border bg-background sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Marcar como assistido?</DialogTitle>
          </DialogHeader>
          <p className="font-sans text-sm text-muted-foreground">
            {confirmMarkWatched?.title} será marcado como assistido na sua lista.
          </p>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setConfirmMarkWatched(null)}>
              Cancelar
            </Button>
            <Button onClick={handleConfirmMarkWatched} disabled={isPending}>
              Marcar como assistido
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <p className="font-sans text-xs text-muted-foreground text-center pt-2 leading-relaxed">
        {displayItems.length}/30 filmes sorteados
      </p>
    </div>
  );
}
