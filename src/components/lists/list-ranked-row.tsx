"use client";

import { useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Trash2,
  Star,
  User2,
} from "lucide-react";
import { toast } from "sonner";
import { removeMovieFromListAction } from "@/actions/list-actions";
import { markWatchedAction } from "@/actions/movie-actions";
import { Button } from "@/components/ui/button";
import { FavoriteStarButton } from "@/components/favorite-star-button";
import { getTmdbPosterUrl } from "@/lib/tmdb-images";
import { buildMovieDetailHref } from "@/lib/grid-url-state";
import type { Movie } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ListRankedRowProps {
  movie: Movie;
  rank: number;
  listId: string;
  canMoveUp: boolean;
  canMoveDown: boolean;
  isReordering: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onUpdated?: (movie: Movie) => void;
  onRemovedFromList?: (id: string) => void;
  returnPath?: string;
}

function formatRuntime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}min`;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

export function ListRankedRow({
  movie,
  rank,
  listId,
  canMoveUp,
  canMoveDown,
  isReordering,
  onMoveUp,
  onMoveDown,
  onUpdated,
  onRemovedFromList,
  returnPath,
}: ListRankedRowProps) {
  const [isPending, startTransition] = useTransition();

  function handleToggleWatched() {
    startTransition(async () => {
      try {
        const updated = await markWatchedAction(movie.id, !movie.watched);
        toast.success(
          movie.watched ? "Removido dos assistidos" : "Marcado como assistido!",
          { description: movie.title }
        );
        onUpdated?.(updated);
      } catch {
        toast.error("Erro ao atualizar filme");
      }
    });
  }

  function handleRemoveFromList() {
    startTransition(async () => {
      try {
        await removeMovieFromListAction(listId, movie.id);
        toast.success("Removido da lista", { description: movie.title });
        onRemovedFromList?.(movie.id);
      } catch {
        toast.error("Erro ao remover da lista");
      }
    });
  }

  const movieHref = buildMovieDetailHref(movie.id, returnPath);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className={cn(
        "flex items-center gap-3 sm:gap-4 rounded-2xl border border-border bg-surface-raised/60 p-3 sm:p-4",
        "transition-opacity duration-200",
        (isPending || isReordering) && "opacity-60 pointer-events-none"
      )}
      data-slot="list-ranked-row"
    >
      <div
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-xl font-display text-lg font-bold",
          rank <= 3 ? "bg-gold/20 text-gold" : "bg-white/5 text-foreground"
        )}
        aria-hidden
      >
        {rank}
      </div>

      <Link
        href={movieHref}
        className="relative size-14 sm:size-16 shrink-0 overflow-hidden rounded-xl border border-border"
      >
        {movie.posterPath ? (
          <Image
            src={getTmdbPosterUrl(movie.posterPath, "w154") ?? movie.posterPath}
            alt={`Poster de ${movie.title}`}
            fill
            sizes="64px"
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-surface-raised text-2xl">🎬</div>
        )}
      </Link>

      <div className="min-w-0 flex-1 space-y-1">
        <Link
          href={movieHref}
          className="block font-display text-sm sm:text-base tracking-wide uppercase text-foreground hover:text-primary transition-colors line-clamp-2"
        >
          {movie.title}
        </Link>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          {movie.year && (
            <span className="inline-flex items-center gap-1">
              <Calendar className="size-3" />
              {movie.year}
            </span>
          )}
          {movie.director && (
            <span className="inline-flex items-center gap-1 truncate max-w-[140px] sm:max-w-xs">
              <User2 className="size-3 shrink-0" />
              {movie.director}
            </span>
          )}
          {movie.runtime != null && movie.runtime > 0 && (
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3" />
              {formatRuntime(movie.runtime)}
            </span>
          )}
          {movie.watched && (
            <span className="inline-flex items-center gap-1 text-primary">
              <CheckCircle2 className="size-3" />
              Visto
            </span>
          )}
          {movie.watched && movie.userRating != null && (
            <span className="inline-flex items-center gap-1">
              <Star className="size-3 fill-gold text-gold" />
              {String(movie.userRating).replace(".", ",")}
            </span>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <FavoriteStarButton
          movieId={movie.id}
          isFavorite={Boolean(movie.isFavorite)}
          onToggled={(next) => onUpdated?.({ ...movie, isFavorite: next })}
          size="sm"
          className="min-h-9 min-w-9"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={`Marcar ${movie.title} como ${movie.watched ? "não assistido" : "assistido"}`}
          onClick={handleToggleWatched}
          className="size-9 text-muted-foreground hover:text-foreground"
        >
          {movie.watched ? <CheckCircle2 className="size-4 text-primary" /> : <CheckCircle2 className="size-4" />}
        </Button>
        <button
          type="button"
          aria-label={`Remover ${movie.title} da lista`}
          onClick={handleRemoveFromList}
          disabled={isPending || isReordering}
          className={cn(
            "inline-flex min-h-9 min-w-9 items-center justify-center rounded-full border transition-all duration-200",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/50",
            "active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
            "border-white/15 bg-black/70 text-muted-foreground hover:border-destructive/40 hover:text-destructive backdrop-blur-sm"
          )}
        >
          <Trash2 className="size-4" />
        </button>
        <div className="ml-1 flex flex-col gap-0.5 border-l border-border pl-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={`Subir ${movie.title} na lista`}
            disabled={!canMoveUp || isReordering}
            onClick={onMoveUp}
            className="size-8"
          >
            <ChevronUp className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={`Descer ${movie.title} na lista`}
            disabled={!canMoveDown || isReordering}
            onClick={onMoveDown}
            className="size-8"
          >
            <ChevronDown className="size-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
