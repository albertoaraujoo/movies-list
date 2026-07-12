"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Search, Loader2, Film } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { getMovies } from "@/lib/api";
import { getTmdbPosterUrl } from "@/lib/tmdb-images";
import type { Movie } from "@/lib/types";
import { cn } from "@/lib/utils";

interface LibraryMovieSearchProps {
  onSelect: (movie: Movie) => void;
  excludeMovieIds?: string[];
  placeholder?: string;
  className?: string;
}

export function LibraryMovieSearch({
  onSelect,
  excludeMovieIds = [],
  placeholder = "Buscar na sua biblioteca...",
  className,
}: LibraryMovieSearchProps) {
  const { data: session } = useSession();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [manualClose, setManualClose] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      setManualClose(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  const { data, isLoading } = useQuery({
    queryKey: ["library-search", debouncedQuery],
    queryFn: () =>
      getMovies(
        {
          search: debouncedQuery.trim(),
          limit: 12,
          page: 1,
        },
        session!.accessToken
      ),
    enabled: !!session?.accessToken && debouncedQuery.trim().length > 0,
  });

  const results = (data?.data ?? []).filter((movie) => !excludeMovieIds.includes(movie.id));
  const isOpen = !manualClose && results.length > 0 && debouncedQuery.trim().length > 0;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setManualClose(true);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelect(movie: Movie) {
    onSelect(movie);
    setManualClose(true);
    setQuery(movie.title);
  }

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (results.length > 0 && !results.some((r) => r.title === query)) {
              setManualClose(false);
            }
          }}
          placeholder={placeholder}
          autoComplete="off"
          className={cn(
            "w-full pl-10 pr-10 py-2.5 rounded-xl text-base",
            "bg-surface-raised border border-border",
            "text-foreground placeholder:text-muted-foreground",
            "focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20",
            "transition-all duration-200"
          )}
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground animate-spin" />
        )}
      </div>

      <AnimatePresence>
        {isOpen && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className={cn(
              "absolute top-full left-0 right-0 mt-2 z-50",
              "rounded-xl border border-white/10 overflow-hidden",
              "bg-neutral-900 shadow-2xl"
            )}
          >
            <ul className="py-1 max-h-72 overflow-y-auto">
              {results.map((movie) => (
                <li key={movie.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(movie)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5",
                      "hover:bg-white/5 transition-colors text-left",
                      "focus:outline-none focus:bg-white/5"
                    )}
                  >
                    <div className="relative shrink-0 w-9 h-14 rounded-md overflow-hidden bg-surface-raised border border-border">
                      {movie.posterPath ? (
                        <Image
                          src={getTmdbPosterUrl(movie.posterPath, "w185") ?? movie.posterPath}
                          alt={movie.title}
                          fill
                          sizes="36px"
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Film className="size-4 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate">{movie.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {movie.year && (
                          <span className="text-xs text-muted-foreground">{movie.year}</span>
                        )}
                        {movie.watched && (
                          <span className="text-xs text-primary">Visto</span>
                        )}
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
