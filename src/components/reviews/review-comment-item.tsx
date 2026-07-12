"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { Loader2, MessageCircle, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { createReviewCommentAction, deleteReviewCommentAction } from "@/actions/review-actions";
import { displayAuthorName, formatRelativeTime } from "@/lib/review-comments";
import type { Review, ReviewComment } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ReviewCommentItemProps {
  comment: ReviewComment;
  review: Review;
  depth?: number;
  onReplyAdded?: (comment: ReviewComment) => void;
  onDeleted?: (commentId: string) => void;
}

export function ReviewCommentItem({
  comment,
  review,
  depth = 0,
  onReplyAdded,
  onDeleted,
}: ReviewCommentItemProps) {
  const { data: session } = useSession();
  const [isPending, startTransition] = useTransition();
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState("");

  const canDelete =
    session?.user?.id === comment.userId || session?.user?.id === review.userId;
  const profileHref = comment.user.username
    ? `/users/${comment.user.username}`
    : undefined;

  function handleReply() {
    if (!replyText.trim()) return;
    startTransition(async () => {
      try {
        const created = await createReviewCommentAction(review.id, {
          text: replyText.trim(),
          parentId: comment.id,
        });
        setReplyText("");
        setReplyOpen(false);
        onReplyAdded?.(created);
        toast.success("Resposta publicada");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Erro ao responder");
      }
    });
  }

  function handleDelete() {
    startTransition(async () => {
      try {
        await deleteReviewCommentAction(review.id, comment.id);
        onDeleted?.(comment.id);
        toast.success("Comentário removido");
      } catch {
        toast.error("Erro ao remover comentário");
      }
    });
  }

  return (
    <div
      className={cn("space-y-3", depth > 0 && "ml-4 sm:ml-8 border-l border-white/8 pl-4")}
      data-slot="review-comment-item"
    >
      <div className="flex gap-3">
        <div className="relative size-9 shrink-0 overflow-hidden rounded-full bg-surface-raised border border-border">
          {comment.user.image ? (
            <Image src={comment.user.image} alt="" fill sizes="36px" className="object-cover" unoptimized />
          ) : (
            <div className="flex size-full items-center justify-center text-xs font-bold text-gold">
              {comment.user.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 space-y-2">
          <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                {profileHref ? (
                  <Link href={profileHref} className="font-sans text-sm font-medium text-foreground hover:text-gold">
                    {displayAuthorName(comment.user)}
                  </Link>
                ) : (
                  <p className="font-sans text-sm font-medium text-foreground">
                    {displayAuthorName(comment.user)}
                  </p>
                )}
                <p className="font-sans text-xs text-muted-foreground">
                  {formatRelativeTime(comment.createdAt)}
                </p>
              </div>
              {canDelete && (
                <button
                  type="button"
                  aria-label="Remover comentário"
                  onClick={handleDelete}
                  disabled={isPending}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="size-3.5" />
                </button>
              )}
            </div>
            <p className="font-sans text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap mt-2">
              {comment.text}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setReplyOpen((v) => !v)}
            className="inline-flex items-center gap-1.5 font-sans text-xs text-muted-foreground hover:text-gold transition-colors"
          >
            <MessageCircle className="size-3.5" />
            Responder
          </button>

          {replyOpen && (
            <div className="space-y-2">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={`Responder ${displayAuthorName(comment.user)}...`}
                rows={3}
                maxLength={2000}
                className={cn(
                  "w-full rounded-xl border border-border bg-surface-raised/50 px-4 py-3",
                  "font-sans text-sm text-foreground placeholder:text-muted-foreground",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 resize-y"
                )}
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleReply} disabled={isPending || !replyText.trim()} className="gap-2">
                  {isPending && <Loader2 className="size-3.5 animate-spin" />}
                  Publicar resposta
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setReplyOpen(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {comment.replies?.map((reply) => (
        <ReviewCommentItem
          key={reply.id}
          comment={reply}
          review={review}
          depth={depth + 1}
          onReplyAdded={onReplyAdded}
          onDeleted={onDeleted}
        />
      ))}
    </div>
  );
}
