"use client";

import { useMemo, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Loader2, MessageCircle } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ReviewCommentItem } from "@/components/reviews/review-comment-item";
import { ReviewLikeButton } from "@/components/reviews/review-like-button";
import { createReviewCommentAction } from "@/actions/review-actions";
import { buildCommentTree, displayAuthorName, formatRelativeTime } from "@/lib/review-comments";
import { getTmdbPosterUrl } from "@/lib/tmdb-images";
import type { ReviewComment, ReviewThread } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ReviewThreadContentProps {
  initialThread: ReviewThread;
}

export function ReviewThreadContent({ initialThread }: ReviewThreadContentProps) {
  const { data: session } = useSession();
  const [review, setReview] = useState(initialThread.review);
  const [comments, setComments] = useState<ReviewComment[]>(initialThread.comments);
  const [newComment, setNewComment] = useState("");
  const [isPending, startTransition] = useTransition();

  const commentTree = useMemo(() => buildCommentTree(comments), [comments]);
  const isOwnReview = session?.user?.id === review.userId;
  const author = review.user;
  const movie = review.movie;
  const profileHref = author?.username ? `/users/${author.username}` : undefined;

  function handleCommentAdded(comment: ReviewComment) {
    setComments((prev) => [...prev, comment]);
    setReview((prev) => ({
      ...prev,
      commentsCount: (prev.commentsCount ?? 0) + 1,
    }));
  }

  function handleCommentDeleted(commentId: string) {
    const idsToRemove = new Set<string>();
    function collect(id: string) {
      idsToRemove.add(id);
      comments.filter((c) => c.parentId === id).forEach((c) => collect(c.id));
    }
    collect(commentId);
    setComments((prev) => prev.filter((c) => !idsToRemove.has(c.id)));
    setReview((prev) => ({
      ...prev,
      commentsCount: Math.max(0, (prev.commentsCount ?? 0) - idsToRemove.size),
    }));
  }

  function handleSubmitComment() {
    if (!newComment.trim()) return;
    startTransition(async () => {
      try {
        const created = await createReviewCommentAction(review.id, {
          text: newComment.trim(),
        });
        setNewComment("");
        handleCommentAdded(created);
        toast.success("Comentário publicado");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Erro ao comentar");
      }
    });
  }

  return (
    <div className="space-y-8" data-slot="review-thread-content">
      <Link
        href={profileHref ?? "/activity"}
        className="inline-flex items-center gap-2 font-sans text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" />
        Voltar
      </Link>

      <article className="rounded-2xl border border-border bg-surface-raised/50 overflow-hidden">
        {movie && (
          <div className="flex flex-col sm:flex-row gap-4 p-4 sm:p-5 border-b border-white/8">
            <Link
              href={`/movies/${movie.id}`}
              className="relative shrink-0 w-full sm:w-24 aspect-[2/3] rounded-xl overflow-hidden border border-border"
            >
              {movie.posterPath ? (
                <Image
                  src={getTmdbPosterUrl(movie.posterPath, "w185") ?? movie.posterPath}
                  alt={movie.title}
                  fill
                  sizes="96px"
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-3xl">🎬</div>
              )}
            </Link>
            <div className="min-w-0 space-y-1">
              <Link
                href={`/movies/${movie.id}`}
                className="font-display tracking-wider uppercase text-lg text-foreground hover:text-gold transition-colors line-clamp-2"
              >
                {movie.title}
              </Link>
              {author && (
                <p className="font-sans text-sm text-muted-foreground">
                  Review de{" "}
                  {profileHref ? (
                    <Link href={profileHref} className="text-gold hover:underline">
                      {displayAuthorName(author)}
                    </Link>
                  ) : (
                    displayAuthorName(author)
                  )}
                </p>
              )}
              {review.watchedAt && (
                <p className="font-sans text-xs text-muted-foreground">
                  Assistido em {new Date(review.watchedAt).toLocaleDateString("pt-BR")}
                </p>
              )}
            </div>
          </div>
        )}

        <div className="p-4 sm:p-5 space-y-4">
          <p className="font-sans text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
            {review.text}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-white/8">
            <ReviewLikeButton
              reviewId={review.id}
              likedByMe={review.likedByMe}
              likesCount={review.likesCount ?? 0}
              disabled={isOwnReview}
              onToggled={(liked, likesCount) =>
                setReview((prev) => ({ ...prev, likedByMe: liked, likesCount }))
              }
            />
            <span className="inline-flex items-center gap-1.5 font-sans text-xs text-muted-foreground">
              <MessageCircle className="size-3.5" />
              {review.commentsCount ?? 0}{" "}
              {(review.commentsCount ?? 0) === 1 ? "comentário" : "comentários"}
            </span>
            <span className="font-sans text-xs text-muted-foreground">
              {formatRelativeTime(review.createdAt)}
            </span>
          </div>
        </div>
      </article>

      <section className="space-y-4">
        <h2 className="font-display tracking-wider uppercase text-sm text-foreground">
          Conversa
        </h2>

        <div className="rounded-2xl border border-border bg-surface-raised/40 p-4 space-y-3">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Escreva um comentário..."
            rows={3}
            maxLength={2000}
            className={cn(
              "w-full rounded-xl border border-border bg-neutral-950/50 px-4 py-3",
              "font-sans text-sm text-foreground placeholder:text-muted-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 resize-y"
            )}
          />
          <Button onClick={handleSubmitComment} disabled={isPending || !newComment.trim()} className="gap-2">
            {isPending && <Loader2 className="size-4 animate-spin" />}
            Comentar
          </Button>
        </div>

        {commentTree.length === 0 ? (
          <p className="font-sans text-sm text-muted-foreground text-center py-8">
            Nenhum comentário ainda. Seja o primeiro a comentar.
          </p>
        ) : (
          <div className="space-y-4">
            {commentTree.map((comment) => (
              <ReviewCommentItem
                key={comment.id}
                comment={comment}
                review={review}
                onReplyAdded={handleCommentAdded}
                onDeleted={handleCommentDeleted}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
