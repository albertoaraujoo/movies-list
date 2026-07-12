"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Pencil, Eye, Heart, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  createReviewAction,
  updateReviewAction,
} from "@/actions/review-actions";
import { markWatchedAction } from "@/actions/movie-actions";
import type { Movie, Review } from "@/lib/types";
import { canEditReview } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ReviewSectionProps {
  movie: Movie;
  review?: Review | null;
  /** Oculta o bloco "Marcar como Assistido" em telas grandes (já exibido no cabeçalho). */
  hideMarkWatchedOnDesktop?: boolean;
}

export function ReviewSection({
  movie,
  review: initialReview,
  hideMarkWatchedOnDesktop = false,
}: ReviewSectionProps) {
  const router = useRouter();
  const [review, setReview] = useState<Review | null>(initialReview ?? null);
  const [text, setText] = useState(initialReview?.text ?? "");
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  const editable = review ? canEditReview(review.createdAt) : true;
  const showEditButton = review && editable && !editing;

  function handleMarkWatched() {
    startTransition(async () => {
      try {
        await markWatchedAction(movie.id, true);
        toast.success("Marcado como assistido!");
        router.refresh();
      } catch {
        toast.error("Erro ao marcar como assistido");
      }
    });
  }

  function handleSaveReview() {
    if (!text.trim()) {
      toast.error("Escreva uma review antes de salvar");
      return;
    }

    startTransition(async () => {
      try {
        if (review) {
          const updated = await updateReviewAction(review.id, { text: text.trim() }, movie.id);
          setReview(updated);
          setEditing(false);
          toast.success("Review atualizada!");
        } else {
          const created = await createReviewAction({
            movieId: movie.id,
            text: text.trim(),
          });
          setReview(created);
          toast.success("Review salva!");
        }
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Erro ao salvar review");
      }
    });
  }

  if (!movie.watched && !review) {
    return (
      <section
        className={cn("space-y-3", hideMarkWatchedOnDesktop && "lg:hidden")}
        data-slot="review-section"
      >
        <h2 className="font-display tracking-wider uppercase text-sm text-foreground">
          Assistido
        </h2>
        <Button onClick={handleMarkWatched} disabled={isPending} className="gap-2">
          {isPending ? <Loader2 className="size-4 animate-spin" /> : <Eye className="size-4" />}
          Marcar como Assistido
        </Button>
      </section>
    );
  }

  return (
    <section className="space-y-3" data-slot="review-section">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-display tracking-wider uppercase text-sm text-foreground">
          {review ? "Sua Review" : "Escrever Review"}
        </h2>
        {showEditButton && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setEditing(true)}
            className="gap-1.5 text-gold hover:text-gold"
          >
            <Pencil className="size-3.5" />
            Editar Review
          </Button>
        )}
      </div>

      {review && !editable && (
        <p className="font-sans text-xs text-muted-foreground">
          Reviews só podem ser editadas nas primeiras 24 horas após a criação.
        </p>
      )}

      {(editing || !review) && editable ? (
        <div className="space-y-3">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="O que achou deste filme?"
            rows={4}
            maxLength={5000}
            className={cn(
              "w-full rounded-xl border border-border bg-surface-raised/50 px-4 py-3",
              "font-sans text-sm text-foreground placeholder:text-muted-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 resize-y min-h-[100px]"
            )}
          />
          <div className="flex gap-2">
            <Button onClick={handleSaveReview} disabled={isPending} className="gap-2">
              {isPending && <Loader2 className="size-4 animate-spin" />}
              {review ? "Salvar alterações" : "Salvar Review"}
            </Button>
            {editing && (
              <Button variant="ghost" onClick={() => { setEditing(false); setText(review?.text ?? ""); }}>
                Cancelar
              </Button>
            )}
          </div>
        </div>
      ) : review ? (
        <div className="space-y-3">
          <div className="rounded-xl border border-white/6 bg-black/20 p-4">
            <p className="font-sans text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
              {review.text}
            </p>
            {review.watchedAt && (
              <p className="font-sans text-xs text-muted-foreground mt-2 pt-2 border-t border-white/6">
                Assistido em{" "}
                {new Date(review.watchedAt).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={`/reviews/${review.id}`}
              className="inline-flex items-center gap-1.5 font-sans text-xs text-gold hover:underline"
            >
              <MessageCircle className="size-3.5" />
              Ver conversa
              {(review.commentsCount ?? 0) > 0 && ` (${review.commentsCount})`}
            </Link>
            <span className="inline-flex items-center gap-1 font-sans text-xs text-muted-foreground">
              <Heart className="size-3.5" />
              {review.likesCount ?? 0} curtidas
            </span>
          </div>
        </div>
      ) : null}
    </section>
  );
}
