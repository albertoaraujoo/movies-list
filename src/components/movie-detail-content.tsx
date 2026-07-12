"use client";

import { useTransition, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Eye,
  Film,
  Loader2,
  RefreshCw,
  User2,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RatingSection } from "@/components/rating-section";
import { ReviewSection } from "@/components/review-section";
import { FavoriteStarButton } from "@/components/favorite-star-button";
import { WatchProvidersSection } from "@/components/watch-providers-section";
import { markWatchedAction, syncMovieTmdbAction } from "@/actions/movie-actions";
import { getTmdbPosterUrl } from "@/lib/tmdb-images";
import type { Movie } from "@/lib/types";

function formatRuntime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}min`;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

interface MovieDetailContentProps {
  movie: Movie;
  returnHref?: string;
}

export function MovieDetailContent({ movie, returnHref = "/dashboard" }: MovieDetailContentProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isPending, startTransition] = useTransition();
  const [isFavorite, setIsFavorite] = useState(Boolean(movie.isFavorite));

  useEffect(() => {
    setIsFavorite(Boolean(movie.isFavorite));
  }, [movie.isFavorite]);

  const hasMissingData =
    movie.overview == null &&
    movie.runtime == null &&
    (movie.genres?.length ?? 0) === 0 &&
    (movie.watchProvidersBr == null ||
      (movie.watchProvidersBr?.flatrate?.length === 0 &&
        movie.watchProvidersBr?.rent?.length === 0 &&
        movie.watchProvidersBr?.buy?.length === 0));

  function handleSyncTmdb() {
    startTransition(async () => {
      try {
        await syncMovieTmdbAction(movie.id);
        queryClient.invalidateQueries({ queryKey: ["movies"] });
        router.refresh();
        toast.success("Dados atualizados com o TMDB", {
          description: movie.title,
        });
      } catch {
        toast.error("Erro ao sincronizar com TMDB");
      }
    });
  }

  function handleMarkWatched() {
    startTransition(async () => {
      try {
        await markWatchedAction(movie.id, true);
        queryClient.invalidateQueries({ queryKey: ["movies"] });
        router.refresh();
        toast.success("Marcado como assistido!");
      } catch {
        toast.error("Erro ao marcar como assistido");
      }
    });
  }

  return (
    <div className="space-y-8">
      <Link
        href={returnHref}
        className="inline-flex items-center gap-2 font-sans text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" />
        Voltar à lista
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row gap-6 lg:gap-8 lg:items-start"
      >
        <div
          className="relative w-full max-w-56 mx-auto lg:mx-0 lg:w-56 shrink-0 rounded-2xl overflow-hidden border border-border bg-surface-raised"
          style={{ aspectRatio: "2/3" }}
        >
          {movie.posterPath ? (
            <Image
              src={getTmdbPosterUrl(movie.posterPath, "w500") ?? movie.posterPath}
              alt={`Poster de ${movie.title}`}
              fill
              sizes="224px"
              className="object-cover"
              priority
              unoptimized
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4">
              <Film className="size-12 text-muted-foreground" />
              <span className="font-display text-center text-sm text-muted-foreground uppercase line-clamp-3">
                {movie.title}
              </span>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 space-y-4">
          <div className="flex items-start gap-3">
            <h1 className="font-display tracking-wider uppercase text-2xl sm:text-3xl leading-tight text-foreground flex-1 min-w-0">
              {movie.title}
            </h1>
            <div className="flex items-center gap-2 shrink-0">
              <FavoriteStarButton
                movieId={movie.id}
                isFavorite={isFavorite}
                onToggled={setIsFavorite}
              />
              {!movie.watched && (
                <Button
                  type="button"
                  onClick={handleMarkWatched}
                  disabled={isPending}
                  className="hidden lg:inline-flex gap-2"
                >
                  {isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                  Marcar como Assistido
                </Button>
              )}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-muted-foreground">
            {movie.year && (
              <span className="flex items-center gap-1.5 font-sans text-sm">
                <Calendar className="size-4" />
                {movie.year}
              </span>
            )}
            {movie.director && (
              <span className="flex items-center gap-1.5 font-sans text-sm">
                <User2 className="size-4" />
                {movie.director}
              </span>
            )}
            {movie.runtime != null && movie.runtime > 0 && (
              <span className="flex items-center gap-1.5 font-sans text-sm">
                <Clock className="size-4" />
                {formatRuntime(movie.runtime)}
              </span>
            )}
          </div>
          {(movie.genres?.length ?? 0) > 0 && (
            <div className="flex flex-wrap gap-2">
              {(movie.genres ?? []).map((genre) => (
                <Badge
                  key={genre}
                  variant="outline"
                  className="glass border-border text-muted-foreground font-sans"
                >
                  {genre}
                </Badge>
              ))}
            </div>
          )}
          <section className="space-y-2">
            <h2 className="font-display tracking-wider uppercase text-sm text-foreground">
              Sinopse
            </h2>
            {movie.overview ? (
              <p className="font-sans text-sm text-muted-foreground leading-relaxed">
                {movie.overview}
              </p>
            ) : (
              <p className="font-sans text-sm text-muted-foreground italic">
                Sinopse não disponível.
              </p>
            )}
          </section>
          {movie.notes && (
            <p className="font-sans text-sm text-muted-foreground leading-relaxed">
              <span className="font-medium text-foreground">Suas notas:</span>{" "}
              {movie.notes}
            </p>
          )}
        </div>
      </motion.div>

      {movie.watched && <RatingSection movie={movie} />}

      <ReviewSection movie={movie} review={movie.review} hideMarkWatchedOnDesktop />

      <WatchProvidersSection providers={movie.watchProvidersBr} />

      {hasMissingData && (
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Button
            variant="outline"
            onClick={handleSyncTmdb}
            disabled={isPending}
            className="gap-2 glass border-border"
          >
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <RefreshCw className="size-4" />
            )}
            Sincronizar com TMDB
          </Button>
        </motion.section>
      )}
    </div>
  );
}
