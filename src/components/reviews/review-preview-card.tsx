"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, MessageCircle } from "lucide-react";
import { ReviewLikeButton } from "@/components/reviews/review-like-button";
import { displayAuthorName, formatRelativeTime } from "@/lib/review-comments";
import { getTmdbPosterUrl } from "@/lib/tmdb-images";
import type { Review } from "@/lib/types";

interface ReviewPreviewCardProps {
  review: Review;
  showLike?: boolean;
}

export function ReviewPreviewCard({ review, showLike = true }: ReviewPreviewCardProps) {
  const movie = review.movie;
  if (!movie) return null;

  return (
    <article
      className="rounded-2xl border border-border bg-surface-raised/50 overflow-hidden hover:border-gold/25 transition-colors"
      data-slot="review-preview-card"
    >
      <Link href={`/reviews/${review.id}`} className="block p-4 sm:p-5 space-y-3">
        <div className="flex gap-3">
          {movie.posterPath && (
            <div className="relative size-14 shrink-0 rounded-lg overflow-hidden border border-border">
              <Image
                src={getTmdbPosterUrl(movie.posterPath, "w92") ?? movie.posterPath}
                alt={movie.title}
                fill
                sizes="56px"
                className="object-cover"
                unoptimized
              />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="font-display tracking-wider uppercase text-sm text-foreground line-clamp-1">
              {movie.title}
            </p>
            {review.user && (
              <p className="font-sans text-xs text-muted-foreground mt-0.5">
                {displayAuthorName(review.user)} · {formatRelativeTime(review.createdAt)}
              </p>
            )}
          </div>
        </div>

        <p className="font-sans text-sm text-foreground/90 leading-relaxed line-clamp-3 whitespace-pre-wrap">
          {review.text}
        </p>

        <div className="flex items-center gap-3 pt-1">
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

      {showLike && review.userId && (
        <div className="px-4 pb-4 -mt-1">
          <ReviewLikeButton
            reviewId={review.id}
            likedByMe={review.likedByMe}
            likesCount={review.likesCount ?? 0}
          />
        </div>
      )}
    </article>
  );
}
