"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shuffle, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { drawMovieAction } from "@/actions/movie-actions";
import { cn } from "@/lib/utils";
import type { DrawnMovie } from "@/lib/types";

interface DrawButtonProps {
  onDrawn?: (drawn: DrawnMovie) => void;
  disabled?: boolean;
}

const ROULETTE_FRAMES = ["🎬", "🎭", "🍿", "🎞️", "🎦", "⭐", "🎬"];

export function DrawButton({ onDrawn, disabled }: DrawButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [isSpinning, setIsSpinning] = useState(false);
  const [revealedMovie, setRevealedMovie] = useState<DrawnMovie | null>(null);
  const [frameIndex, setFrameIndex] = useState(0);

  function startRoulette() {
    setIsSpinning(true);
    setRevealedMovie(null);

    let count = 0;
    const interval = setInterval(() => {
      setFrameIndex((i) => (i + 1) % ROULETTE_FRAMES.length);
      count++;
      if (count >= 14) clearInterval(interval);
    }, 120);

    startTransition(async () => {
      try {
        await new Promise((r) => setTimeout(r, 1800));
        const drawn = await drawMovieAction();
        clearInterval(interval);
        setIsSpinning(false);
        setRevealedMovie(drawn);
        onDrawn?.(drawn);
        toast.success("Filme sorteado!", {
          description: drawn.movie.title,
          icon: "🎲",
        });
      } catch (err) {
        clearInterval(interval);
        setIsSpinning(false);
        const msg = err instanceof Error ? err.message : "Erro ao sortear filme";
        toast.error(msg);
      }
    });
  }

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Botão principal */}
      <motion.button
        onClick={startRoulette}
        disabled={isPending || isSpinning || disabled}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className={cn(
          "relative flex items-center gap-3 px-8 py-4 rounded-2xl",
          "font-display tracking-[0.12em] uppercase text-lg",
          "bg-cinema-red text-white border border-white/10",
          "shadow-lg shadow-cinema-red/30",
          "transition-all duration-200",
          "disabled:pointer-events-none disabled:opacity-50",
          "overflow-hidden group"
        )}
      >
        {/* Shimmer */}
        <motion.div
          className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full"
          animate={!isPending ? { translateX: ["−100%", "100%"] } : {}}
          transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
        />

        {isSpinning ? (
          <>
            <motion.span
              key={frameIndex}
              initial={{ rotateY: -90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              transition={{ duration: 0.1 }}
              className="text-2xl"
            >
              {ROULETTE_FRAMES[frameIndex]}
            </motion.span>
            <span>Sorteando...</span>
          </>
        ) : (
          <>
            <Shuffle className="size-5" />
            <span>Sortear Filme</span>
            <Sparkles className="size-4 opacity-70" />
          </>
        )}
      </motion.button>

      {/* Revelação do filme sorteado */}
      <AnimatePresence mode="wait">
        {revealedMovie && (
          <motion.div
            key={revealedMovie.id}
            initial={{ opacity: 0, scale: 0.7, rotateY: -90 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 18,
              duration: 0.5,
            }}
            className="flex flex-col items-center gap-3"
          >
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <p className="font-display tracking-[0.14em] uppercase text-gold text-base text-center">
                🎲 Próximo a assistir
              </p>
            </motion.div>

            <div className="relative w-32 rounded-xl overflow-hidden border border-gold/30 poster-shadow cinema-glow">
              <div style={{ aspectRatio: "2/3" }}>
                {revealedMovie.movie.posterPath ? (
                  <Image
                    src={revealedMovie.movie.posterPath}
                    alt={revealedMovie.movie.title}
                    fill
                    sizes="128px"
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-surface-raised">
                    <span className="text-4xl">🎬</span>
                  </div>
                )}
              </div>
            </div>

            <div className="text-center space-y-0.5">
              <p className="font-display tracking-wider uppercase text-[clamp(1rem,2.5vw,1.25rem)] leading-tight text-foreground">
                {revealedMovie.movie.title}
              </p>
              {revealedMovie.movie.year && (
                <p className="font-sans text-xs text-muted-foreground leading-relaxed">
                  {revealedMovie.movie.year}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
