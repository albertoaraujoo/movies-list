"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Circle,
  Trash2,
  Eye,
  EyeOff,
  Calendar,
  User2,
  MoreVertical,
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
import type { Movie } from "@/lib/types";
import { cn } from "@/lib/utils";

interface MovieCardProps {
  movie: Movie;
  onDeleted?: (id: string) => void;
  onUpdated?: (movie: Movie) => void;
}

export function MovieCard({ movie, onDeleted, onUpdated }: MovieCardProps) {
  const [isHovered, setIsHovered] = useState(false);
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
      {/* Poster — proporção 2:3 estilo cinema */}
      <div
        className={cn(
          "relative w-full overflow-hidden rounded-2xl cursor-pointer",
          "border transition-all duration-300",
          movie.watched
            ? "border-primary/30 opacity-70"
            : "border-border hover:border-primary/40",
          isPending && "pointer-events-none opacity-50"
        )}
        style={{ aspectRatio: "2/3" }}
      >
        {movie.posterPath ? (
          <Image
            src={movie.posterPath}
            alt={`Poster de ${movie.title}`}
            fill
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 25vw, 18vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-surface-raised px-3">
            <span className="text-4xl">🎬</span>
            <span className="font-display tracking-widest uppercase text-center text-[clamp(0.6rem,1.1vw,0.8rem)] leading-tight text-gold/80 line-clamp-3">
              {movie.title}
            </span>
          </div>
        )}

        {/* Overlay com glassmorphism ao hover */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 glass flex flex-col justify-between p-3"
            >
              {/* Topo: menu */}
              <div className="flex justify-end">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      aria-label="Opções do filme"
                      className="p-1.5 rounded-lg glass hover:bg-white/10 transition-colors"
                    >
                      <MoreVertical className="size-4 text-foreground" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="glass border-border">
                    <DropdownMenuItem onClick={handleToggleWatched}>
                      {movie.watched ? (
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
                    <DropdownMenuItem
                      onClick={handleDelete}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="size-4" /> Remover
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Base: título e infos */}
              <div className="space-y-1.5">
                <p className="font-display tracking-wider uppercase text-[clamp(0.7rem,1.3vw,0.85rem)] leading-tight text-foreground line-clamp-2">
                  {movie.title}
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  {movie.year && (
                    <span className="flex items-center gap-1 font-sans text-xs text-muted-foreground leading-relaxed">
                      <Calendar className="size-3 shrink-0" />
                      {movie.year}
                    </span>
                  )}
                  {movie.director && (
                    <span className="flex items-center gap-1 font-sans text-xs text-muted-foreground leading-relaxed">
                      <User2 className="size-3 shrink-0" />
                      <span className="truncate max-w-[80px]">{movie.director}</span>
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Badge "Assistido" */}
        {movie.watched && (
          <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/90 text-primary-foreground text-xs font-semibold">
            <CheckCircle2 className="size-3" />
            Visto
          </div>
        )}

        {/* Indicador de sorteado */}
        {movie.drawn && !movie.watched && (
          <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-cinema-red/90 text-white text-xs font-semibold">
            🎲 Sorteado
          </div>
        )}
      </div>

      {/* Título abaixo do poster (mobile-friendly) */}
      <div className="mt-2 px-0.5 space-y-0.5">
        <p className="font-display tracking-wider uppercase text-[clamp(0.65rem,1.1vw,0.8rem)] text-foreground line-clamp-1 leading-tight">
          {movie.title}
        </p>
        {movie.year && (
          <p className="font-sans text-[0.65rem] text-muted-foreground leading-relaxed">
            {movie.year}
          </p>
        )}
      </div>

      {/* Botão rápido de "marcar assistido" sem hover no card */}
      <button
        aria-label={movie.watched ? "Desmarcar assistido" : "Marcar como assistido"}
        onClick={handleToggleWatched}
        disabled={isPending}
        className={cn(
          "absolute bottom-[52px] right-2 p-1.5 rounded-full transition-all duration-200",
          "opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100",
          "bg-surface/80 backdrop-blur-sm border border-border hover:border-primary/50",
          movie.watched ? "text-primary" : "text-muted-foreground hover:text-primary"
        )}
      >
        {movie.watched ? (
          <CheckCircle2 className="size-4" />
        ) : (
          <Circle className="size-4" />
        )}
      </button>
    </motion.div>
  );
}
