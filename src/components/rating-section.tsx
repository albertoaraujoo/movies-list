"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { updateMovieAction } from "@/actions/movie-actions";
import type { Movie } from "@/lib/types";
import { cn } from "@/lib/utils";

const RATING_OPTIONS: number[] = [];
for (let i = 0; i <= 20; i++) RATING_OPTIONS.push(i * 0.5);

function formatRating(value: number): string {
  return value === Math.floor(value) ? String(value) : String(value).replace(".", ",");
}

interface RatingSectionProps {
  movie: Movie;
}

export function RatingSection({ movie }: RatingSectionProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isPending, startTransition] = useTransition();

  function handleSetRating(value: number) {
    startTransition(async () => {
      try {
        const updated = await updateMovieAction(movie.id, { userRating: value });
        queryClient.invalidateQueries({ queryKey: ["movies"] });
        router.refresh();
        toast.success("Nota atribuída", { description: `${updated.title}: ${formatRating(value)}` });
      } catch {
        toast.error("Erro ao salvar nota");
      }
    });
  }

  return (
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
            movie.userRating != null &&
            Math.abs((movie.userRating ?? 0) - value) < 0.01;
          return (
            <button
              key={value}
              type="button"
              disabled={isPending}
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
  );
}
