"use client";

import type { Movie } from "@/lib/types";
import { WatchedMovieCard } from "@/components/watched-movie-card";

interface WatchedPageContentProps {
  movies: Movie[];
}

export function WatchedPageContent({ movies }: WatchedPageContentProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display tracking-wider uppercase text-2xl sm:text-3xl text-foreground">
          Filmes Assistidos
        </h1>
        <p className="font-sans text-sm text-muted-foreground mt-1">
          {movies.length} {movies.length === 1 ? "filme assistido" : "filmes assistidos"}
        </p>
      </div>

      {movies.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-dashed border-border">
          <p className="font-sans text-muted-foreground">
            Você ainda não marcou nenhum filme como assistido.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {movies.map((movie, i) => (
            <WatchedMovieCard
              key={movie.id}
              review={
                movie.review ?? {
                  id: movie.id,
                  text: "",
                  watchedAt: movie.updatedAt,
                  movieId: movie.id,
                  userId: movie.userId,
                  createdAt: movie.createdAt,
                  updatedAt: movie.updatedAt,
                  movie,
                }
              }
              priority={i < 3}
            />
          ))}
        </div>
      )}
    </div>
  );
}
