"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Search, Loader2, Film } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface TmdbResult {
  id: number;
  title: string;
  posterPath: string | null;
  year: number | null;
  overview: string;
  rating: number;
}

interface MovieSearchAutocompleteProps {
  onSelect: (movie: TmdbResult) => void;
  placeholder?: string;
  className?: string;
}

export function MovieSearchAutocomplete({
  onSelect,
  placeholder = "Buscar filme no TMDB...",
  className,
}: MovieSearchAutocompleteProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TmdbResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/tmdb/search?q=${encodeURIComponent(query)}`);
        const data: TmdbResult[] = await res.json();
        setResults(data);
        setIsOpen(data.length > 0);
      } catch {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelect(movie: TmdbResult) {
    onSelect(movie);
    setQuery(movie.title);
    setIsOpen(false);
  }

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          autoComplete="off"
          className={cn(
            "w-full pl-10 pr-10 py-2.5 rounded-xl text-sm",
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
                    {/* Poster miniatura */}
                    <div className="relative shrink-0 w-9 h-14 rounded-md overflow-hidden bg-surface-raised border border-border">
                      {movie.posterPath ? (
                        <Image
                          src={movie.posterPath}
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

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate">
                        {movie.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {movie.year && (
                          <span className="text-xs text-muted-foreground">
                            {movie.year}
                          </span>
                        )}
                        {movie.rating > 0 && (
                          <span className="text-xs text-gold">
                            ★ {movie.rating.toFixed(1)}
                          </span>
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
