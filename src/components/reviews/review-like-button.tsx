"use client";

import { useState, useTransition, useEffect } from "react";
import { Heart, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { toggleReviewLikeAction } from "@/actions/review-actions";
import { cn } from "@/lib/utils";

export interface ReviewLikeButtonProps {
  reviewId: string;
  likedByMe?: boolean;
  likesCount?: number;
  disabled?: boolean;
  onToggled?: (liked: boolean, likesCount: number) => void;
  className?: string;
}

export function ReviewLikeButton({
  reviewId,
  likedByMe = false,
  likesCount = 0,
  disabled = false,
  onToggled,
  className,
}: ReviewLikeButtonProps) {
  const [liked, setLiked] = useState(likedByMe);
  const [count, setCount] = useState(likesCount);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setLiked(likedByMe);
    setCount(likesCount);
  }, [likedByMe, likesCount]);

  function handleToggle() {
    if (disabled) return;
    startTransition(async () => {
      try {
        const result = await toggleReviewLikeAction(reviewId);
        setLiked(result.liked);
        setCount(result.likesCount);
        onToggled?.(result.liked, result.likesCount);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Erro ao curtir review");
      }
    });
  }

  return (
    <button
      type="button"
      data-slot="review-like-button"
      aria-label={liked ? "Remover curtida" : "Curtir review"}
      aria-pressed={liked}
      onClick={handleToggle}
      disabled={disabled || isPending}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50",
        "active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
        liked
          ? "border-gold/50 bg-gold/15 text-gold"
          : "border-border bg-surface-raised/60 text-muted-foreground hover:border-gold/40 hover:text-gold",
        className
      )}
    >
      {isPending ? (
        <Loader2 className="size-3.5 animate-spin" />
      ) : (
        <Heart className={cn("size-3.5", liked && "fill-gold text-gold")} />
      )}
      {count}
    </button>
  );
}
