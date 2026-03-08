"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Film,
  Loader2,
  RefreshCw,
  User2,
  Star,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { syncMovieTmdbAction, updateMovieAction } from "@/actions/movie-actions";
import { getTmdbPosterUrl } from "@/lib/tmdb-images";
import type { Movie, WatchProvider } from "@/lib/types";
import { cn } from "@/lib/utils";

const RATING_OPTIONS: number[] = [];
for (let i = 0; i <= 20; i++) RATING_OPTIONS.push(i * 0.5);

const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";
const LOGO_SIZE = "w92";

function formatRuntime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}min`;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

function ProviderList({
  title,
  providers,
}: {
  title: string;
  providers: WatchProvider[];
}) {
  if (!providers?.length) return null;
  return (
    <div className="space-y-2">
      <p className="font-sans text-xs font-medium text-muted-foreground uppercase tracking-wider">
        {title}
      </p>
      <div className="flex flex-wrap gap-3">
        {providers.map((p) => {
          const logoSrc =
            p.logoUrl ?? (p.logo_path ? `${TMDB_IMAGE_BASE}/${LOGO_SIZE}${p.logo_path}` : null);
          return (
            <div
              key={p.provider_id}
              className="flex items-center gap-2 rounded-lg glass border border-border px-2.5 py-1.5"
            >
              {logoSrc ? (
                <div className="relative h-6 w-6 shrink-0 overflow-hidden rounded">
                  <Image
                    src={logoSrc}
                    alt=""
                    width={24}
                    height={24}
                    className="object-contain"
                    unoptimized
                  />
                </div>
              ) : (
                <Film className="size-4 shrink-0 text-muted-foreground" />
              )}
              <span className="font-sans text-sm text-foreground">
                {p.provider_name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface MovieDetailContentProps {
  movie: Movie;
}

function formatRating(value: number): string {
  return value === Math.floor(value) ? String(value) : String(value).replace(".", ",");
}

export function MovieDetailContent({ movie }: MovieDetailContentProps) {
  const queryClient = useQueryClient();
  const [currentMovie, setCurrentMovie] = useState(movie);
  const [isPending, startTransition] = useTransition();
  const [ratingPending, setRatingPending] = useState(false);
  const hasMissingData =
    currentMovie.overview == null &&
    currentMovie.runtime == null &&
    (currentMovie.watchProvidersBr == null ||
      (currentMovie.watchProvidersBr?.flatrate?.length === 0 &&
        currentMovie.watchProvidersBr?.rent?.length === 0 &&
        currentMovie.watchProvidersBr?.buy?.length === 0));

  function handleSyncTmdb() {
    startTransition(async () => {
      try {
        const updated = await syncMovieTmdbAction(currentMovie.id);
        setCurrentMovie(updated);
        toast.success("Dados atualizados com o TMDB", {
          description: updated.title,
        });
      } catch {
        toast.error("Erro ao sincronizar com TMDB");
      }
    });
  }

  function handleSetRating(value: number) {
    setRatingPending(true);
    updateMovieAction(currentMovie.id, { userRating: value })
      .then((updated) => {
        setCurrentMovie(updated);
        queryClient.invalidateQueries({ queryKey: ["movies"] });
        toast.success("Nota atribuída", { description: `${updated.title}: ${formatRating(value)}` });
      })
      .catch(() => toast.error("Erro ao salvar nota"))
      .finally(() => setRatingPending(false));
  }

  const w = currentMovie.watchProvidersBr;

  return (
    <div className="space-y-8">
      {/* Voltar */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 font-sans text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" />
        Voltar à lista
      </Link>

      {/* Cabeçalho: poster + título e metadados */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row gap-6 sm:gap-8"
      >
        <div
          className="relative w-full sm:w-56 shrink-0 rounded-2xl overflow-hidden border border-border bg-surface-raised"
          style={{ aspectRatio: "2/3" }}
        >
          {currentMovie.posterPath ? (
            <Image
              src={getTmdbPosterUrl(currentMovie.posterPath, "w500") ?? currentMovie.posterPath}
              alt={`Poster de ${currentMovie.title}`}
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
                {currentMovie.title}
              </span>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 space-y-4">
          <h1 className="font-display tracking-wider uppercase text-2xl sm:text-3xl leading-tight text-foreground">
            {currentMovie.title}
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-muted-foreground">
            {currentMovie.year && (
              <span className="flex items-center gap-1.5 font-sans text-sm">
                <Calendar className="size-4" />
                {currentMovie.year}
              </span>
            )}
            {currentMovie.director && (
              <span className="flex items-center gap-1.5 font-sans text-sm">
                <User2 className="size-4" />
                {currentMovie.director}
              </span>
            )}
            {currentMovie.runtime != null && currentMovie.runtime > 0 && (
              <span className="flex items-center gap-1.5 font-sans text-sm">
                <Clock className="size-4" />
                {formatRuntime(currentMovie.runtime)}
              </span>
            )}
          </div>
          {currentMovie.notes && (
            <p className="font-sans text-sm text-muted-foreground leading-relaxed">
              <span className="font-medium text-foreground">Suas notas:</span>{" "}
              {currentMovie.notes}
            </p>
          )}
        </div>
      </motion.div>

      {/* Sua nota — só quando o filme foi assistido */}
      {currentMovie.watched && (
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.03 }}
          className="space-y-3"
        >
          <h2 className="font-display tracking-wider uppercase text-sm text-foreground flex items-center gap-2">
            <Star className="size-4 fill-gold text-gold" />
            Sua nota
          </h2>
          <p className="font-sans text-xs text-muted-foreground">
            Clique em um valor para atribuir sua nota (0 a 10).
          </p>
          <div className="flex flex-wrap gap-1.5">
            {RATING_OPTIONS.map((value) => {
              const isSelected =
                currentMovie.userRating != null &&
                Math.abs((currentMovie.userRating ?? 0) - value) < 0.01;
              return (
                <button
                  key={value}
                  type="button"
                  disabled={ratingPending}
                  onClick={() => handleSetRating(value)}
                  className={cn(
                    "min-w-9 px-2 py-1.5 rounded-lg border font-sans text-sm font-medium transition-all duration-200",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                    "disabled:pointer-events-none disabled:opacity-50",
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-surface-raised/80 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  )}
                >
                  {formatRating(value)}
                </button>
              );
            })}
          </div>
        </motion.section>
      )}

      {/* Sinopse */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="space-y-2"
      >
        <h2 className="font-display tracking-wider uppercase text-sm text-foreground">
          Sinopse
        </h2>
        {currentMovie.overview ? (
          <p className="font-sans text-sm text-muted-foreground leading-relaxed">
            {currentMovie.overview}
          </p>
        ) : (
          <p className="font-sans text-sm text-muted-foreground italic">
            Sinopse não disponível.
          </p>
        )}
      </motion.section>

      {/* Onde assistir no Brasil */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-4"
      >
        <h2 className="font-display tracking-wider uppercase text-sm text-foreground">
          Onde assistir no Brasil
        </h2>
        {w?.flatrate?.length ||
        w?.rent?.length ||
        w?.buy?.length ? (
          <div className="space-y-4 rounded-2xl glass border border-border p-4">
            <ProviderList title="Streaming" providers={w.flatrate ?? []} />
            <ProviderList title="Aluguel" providers={w.rent ?? []} />
            <ProviderList title="Compra" providers={w.buy ?? []} />
            {w.link && (
              <a
                href={w.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block font-sans text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                Ver na TMDB →
              </a>
            )}
          </div>
        ) : (
          <p className="font-sans text-sm text-muted-foreground italic">
            Dados de onde assistir não disponíveis.
          </p>
        )}
      </motion.section>

      {/* Atribuição JustWatch */}
      {(w?.flatrate?.length || w?.rent?.length || w?.buy?.length) && (
        <p className="font-sans text-[0.65rem] text-muted-foreground leading-relaxed">
          Dados de disponibilidade: JustWatch
        </p>
      )}

      {/* Sincronizar com TMDB */}
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
