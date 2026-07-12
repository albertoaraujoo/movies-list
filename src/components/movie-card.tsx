"use client";

import { useState, useTransition, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Trash2,
  Eye,
  EyeOff,
  Calendar,
  User2,
  MoreVertical,
  Info,
  Star,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteMovieAction, markWatchedAction } from "@/actions/movie-actions";
import { removeMovieFromListAction } from "@/actions/list-actions";
import { FavoriteStarButton } from "@/components/favorite-star-button";
import { getTmdbPosterUrl } from "@/lib/tmdb-images";
import { buildMovieDetailHref } from "@/lib/grid-url-state";
import type { Movie } from "@/lib/types";
import { cn } from "@/lib/utils";

interface MovieCardProps {
  movie: Movie;
  listId?: string;
  listRank?: number;
  onDeleted?: (id: string) => void;
  onRemovedFromList?: (id: string) => void;
  onUpdated?: (movie: Movie) => void;
  /** Primeiros cards acima da dobra: eager; demais: lazy */
  priority?: boolean;
  /** Caminho de retorno (lista + query) para preservar paginação */
  returnPath?: string;
}

function formatRuntime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}min`;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

export function MovieCard({
  movie,
  listId,
  listRank,
  onDeleted,
  onRemovedFromList,
  onUpdated,
  priority,
  returnPath,
}: MovieCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isFavorite, setIsFavorite] = useState(Boolean(movie.isFavorite));
  const [watched, setWatched] = useState(Boolean(movie.watched));

  useEffect(() => {
    setIsFavorite(Boolean(movie.isFavorite));
  }, [movie.isFavorite]);

  useEffect(() => {
    setWatched(Boolean(movie.watched));
  }, [movie.watched]);

  function handleToggleWatched() {
    startTransition(async () => {
      try {
        const updated = await markWatchedAction(movie.id, !watched);
        toast.success(
          watched ? "Removido dos assistidos" : "Marcado como assistido!",
          { description: movie.title }
        );
        setWatched(updated.watched);
        onUpdated?.(updated);
      } catch {
        toast.error("Erro ao atualizar filme");
      }
    });
  }

  function handleDelete() {
    startTransition(async () => {
      try {
        await deleteMovieAction(movie.id);
        toast.success("Filme removido", { description: movie.title });
        onDeleted?.(movie.id);
      } catch {
        toast.error("Erro ao remover filme");
      }
    });
  }

  function handleRemoveFromList() {
    if (!listId) return;
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
      layoutId={`movie-${movie.id}`}
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.94, y: -12 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4 }}
      className="group relative"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      data-slot="movie-card"
    >
      {/* Wrapper do poster: badges ficam por cima (z-10) para não herdarem opacity do Link */}
      <div className="relative w-full" style={{ aspectRatio: "2/3" }}>
        <Link
          href={movieHref}
          className={cn(
            "block relative w-full h-full overflow-hidden rounded-2xl cursor-pointer",
            "border transition-all duration-300",
            watched
              ? "border-primary/30 opacity-50"
              : "border-border opacity-100 hover:border-primary/40",
            isPending && "pointer-events-none opacity-50"
          )}
        >
          {movie.posterPath ? (
            <Image
              src={getTmdbPosterUrl(movie.posterPath, "w300") ?? movie.posterPath}
              alt={`Poster de ${movie.title}`}
              fill
              sizes="(max-width: 640px) 45vw, (max-width: 1024px) 25vw, 18vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              loading={priority ? "eager" : "lazy"}
              unoptimized
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-surface-raised px-3">
              <span className="text-4xl">🎬</span>
              <span className="font-display tracking-widest uppercase text-center text-[clamp(0.6rem,1.1vw,0.8rem)] leading-tight text-gold/80 line-clamp-3">
                {movie.title}
              </span>
            </div>
          )}

          {/* Faixa de dados ao hover (desktop): só sobre título/ano/diretor, resto do poster visível */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute bottom-0 left-0 right-0 p-3 max-sm:hidden sm:block bg-black/75 backdrop-blur-sm rounded-b-2xl"
                onClick={(e) => e.preventDefault()}
              >
                <div className="space-y-1.5">
                  <p className="font-display tracking-wider uppercase text-[clamp(0.7rem,1.3vw,0.85rem)] leading-tight text-foreground line-clamp-2">
                    {movie.title}
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {movie.year && (
                      <span className="flex items-center gap-1 font-sans text-xs text-foreground/95 leading-relaxed">
                        <Calendar className="size-3 shrink-0" />
                        {movie.year}
                      </span>
                    )}
                    {movie.director && (
                      <span className="flex items-center gap-1 font-sans text-xs text-foreground/95 leading-relaxed">
                        <User2 className="size-3 shrink-0" />
                        <span className="truncate max-w-[80px]">{movie.director}</span>
                      </span>
                    )}
                    {movie.runtime != null && movie.runtime > 0 && (
                      <span className="flex items-center gap-1 font-sans text-xs text-foreground/95 leading-relaxed">
                        <Clock className="size-3 shrink-0" />
                        {formatRuntime(movie.runtime)}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Link>

        {/* Badges por cima da opacidade do poster (z-10, fora do Link) */}
        {listRank != null && (
          <div className="absolute top-2 left-2 z-10 flex size-7 items-center justify-center rounded-full bg-gold/90 text-black text-xs font-bold shadow-md pointer-events-none">
            {listRank}
          </div>
        )}

        {watched && (
          <div
            className={cn(
              "absolute z-10 flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/95 text-primary-foreground text-xs font-semibold pointer-events-none shadow-md",
              listRank != null ? "top-2 left-11" : "top-2 left-2"
            )}
          >
            <CheckCircle2 className="size-3" />
            Visto
          </div>
        )}

        {watched && movie.userRating != null && (
          <div className="absolute bottom-2 right-2 z-10 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/85 border border-white/20 text-foreground text-xs font-semibold pointer-events-none shadow-md">
            <Star className="size-3 fill-gold text-gold" />
            {Number(movie.userRating) === Math.floor(movie.userRating)
              ? String(movie.userRating)
              : String(movie.userRating).replace(".", ",")}
          </div>
        )}

        <div className="absolute top-2 right-2 z-20">
          <FavoriteStarButton
            movieId={movie.id}
            isFavorite={isFavorite}
            onToggled={(next) => {
              setIsFavorite(next);
              onUpdated?.({ ...movie, isFavorite: next });
            }}
            size="sm"
            className="min-h-9 min-w-9"
          />
        </div>

        {movie.drawn && !watched && (
          <div
            className={cn(
              "absolute z-10 flex items-center gap-1 px-2 py-0.5 rounded-full bg-cinema-red/95 text-white text-xs font-semibold pointer-events-none shadow-md",
              listRank != null ? "top-2 left-11" : "top-2 left-2"
            )}
          >
            🎲 Sorteado
          </div>
        )}
      </div>

      {/* Título + ações: Ver mais (olho + texto), Visto/Não visto (verde/vermelho), três pontos — iguais em mobile e desktop */}
      <div className="mt-2 px-0.5 space-y-1">
        <div className="flex items-center gap-2 min-w-0">
          <p className="font-display tracking-wider uppercase text-[clamp(0.65rem,1.1vw,0.8rem)] text-foreground line-clamp-1 leading-tight flex-1 min-w-0">
            {movie.title}
          </p>
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Visto / Não visto — tons de amarelo do projeto: visto = check, não visto = olho */}
            <button
              type="button"
              aria-label={watched ? "Desmarcar assistido" : "Marcar como assistido"}
              onClick={handleToggleWatched}
              disabled={isPending}
              className={cn(
                "flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-xl border transition-all duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                "active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
                watched
                  ? "border-primary bg-primary text-primary-foreground hover:brightness-110 focus-visible:ring-primary/50"
                  : "border-gold bg-gold/20 text-gold hover:bg-gold/30 focus-visible:ring-gold/50"
              )}
            >
              {watched ? (
                <CheckCircle2 className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
            {/* Três pontos — opções, mobile e desktop */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label="Opções do filme"
                  className={cn(
                    "flex p-2 rounded-full border transition-all duration-200 min-w-[44px] min-h-[44px] items-center justify-center",
                    "bg-surface-raised/90 border-border hover:border-primary/50 hover:bg-white/5",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                  )}
                >
                  <MoreVertical className="size-4 text-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="border-border bg-background shadow-lg">
                <DropdownMenuItem asChild>
                  <Link href={movieHref}>
                    <Info className="size-4" />
                    Ver detalhes
                  </Link>
                </DropdownMenuItem>
                {watched && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href={movieHref}>
                        <Star className="size-4" />
                        Atribuir nota
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleToggleWatched}>
                  {watched ? (
                    <>
                      <EyeOff className="size-4" /> Desmarcar assistido
                    </>
                  ) : (
                    <>
                      <Eye className="size-4" /> Marcar como assistido
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {listId ? (
                  <DropdownMenuItem
                    onClick={handleRemoveFromList}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="size-4" /> Remover da lista
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    onClick={handleDelete}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="size-4" /> Remover
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        {(movie.year || (movie.runtime != null && movie.runtime > 0)) && (
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 font-sans text-[0.65rem] text-muted-foreground leading-relaxed">
            {movie.year && <span>{movie.year}</span>}
            {movie.runtime != null && movie.runtime > 0 && (
              <span className="flex items-center gap-1">
                <Clock className="size-3 shrink-0" />
                {formatRuntime(movie.runtime)}
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
