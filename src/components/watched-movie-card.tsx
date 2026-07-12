"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar, Clock, Star, User2, Heart, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { FavoriteStarButton } from "@/components/favorite-star-button";
import { getTmdbPosterUrl } from "@/lib/tmdb-images";
import { buildMovieDetailHref } from "@/lib/grid-url-state";
import type { Review } from "@/lib/types";
import { cn } from "@/lib/utils";

interface WatchedMovieCardProps {
  review: Review;
  priority?: boolean;
  returnPath?: string;
}

function formatRuntime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}min`;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

function formatDate(dateStr: string | null): string | null {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function WatchedMovieCard({ review, priority, returnPath = "/watched" }: WatchedMovieCardProps) {
  const movie = review.movie;
  if (!movie) return null;

  const watchedDate = formatDate(review.watchedAt);
  const movieHref = buildMovieDetailHref(movie.id, returnPath);

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-border bg-surface-raised/60 overflow-hidden"
      data-slot="watched-movie-card"
    >
      <div className="flex flex-col sm:flex-row">
        <Link
          href={movieHref}
          className="relative shrink-0 w-full sm:w-36 aspect-[2/3] sm:aspect-auto sm:h-auto overflow-hidden group"
        >
          {movie.posterPath ? (
            <Image
              src={getTmdbPosterUrl(movie.posterPath, "w300") ?? movie.posterPath}
              alt={`Poster de ${movie.title}`}
              fill
              sizes="144px"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              loading={priority ? "eager" : "lazy"}
              unoptimized
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-surface-raised text-4xl">
              🎬
            </div>
          )}
        </Link>

        <div className="flex-1 p-4 sm:p-5 space-y-3 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <Link
                href={movieHref}
                className="font-display tracking-wider uppercase text-base sm:text-lg text-foreground hover:text-gold transition-colors line-clamp-2"
              >
                {movie.title}
              </Link>
              <div className="flex flex-wrap items-center gap-2 mt-1.5 text-muted-foreground">
                {movie.director && (
                  <span className="flex items-center gap-1 font-sans text-xs">
                    <User2 className="size-3 shrink-0" />
                    {movie.director}
                  </span>
                )}
                {movie.runtime != null && movie.runtime > 0 && (
                  <span className="flex items-center gap-1 font-sans text-xs">
                    <Clock className="size-3 shrink-0" />
                    {formatRuntime(movie.runtime)}
                  </span>
                )}
                {watchedDate && (
                  <span className="flex items-center gap-1 font-sans text-xs">
                    <Calendar className="size-3 shrink-0" />
                    {watchedDate}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <FavoriteStarButton
                movieId={movie.id}
                isFavorite={movie.isFavorite}
                size="sm"
                className="min-h-9 min-w-9"
              />
              {movie.userRating != null && (
                <Badge className="gap-1 bg-primary text-primary-foreground border-primary/30">
                  <Star className="size-3 fill-current" />
                  {Number(movie.userRating) === Math.floor(movie.userRating)
                    ? String(movie.userRating)
                    : String(movie.userRating).replace(".", ",")}
                </Badge>
              )}
            </div>
          </div>

          {review.text && (
            <Link
              href={`/reviews/${review.id}`}
              className={cn("block rounded-xl border border-white/6 bg-black/20 p-3 hover:border-gold/25 transition-colors")}
            >
              <p className="font-sans text-xs uppercase tracking-wider text-muted-foreground mb-1">
                Review
              </p>
              <p className="font-sans text-sm text-foreground/90 leading-relaxed line-clamp-4">
                {review.text}
              </p>
              <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/6">
                <span className="inline-flex items-center gap-1 font-sans text-xs text-muted-foreground">
                  <Heart className="size-3.5" />
                  {review.likesCount ?? 0}
                </span>
                <span className="inline-flex items-center gap-1 font-sans text-xs text-muted-foreground">
                  <MessageCircle className="size-3.5" />
                  {review.commentsCount ?? 0}
                </span>
                <span className="font-sans text-xs text-gold ml-auto">Ver conversa →</span>
              </div>
            </Link>
          )}
        </div>
      </div>
    </motion.article>
  );
}
