"use client";

import Link from "next/link";
import { Film, List, Eye } from "lucide-react";
import type { ActivityLog } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ActivityItemProps {
  activity: ActivityLog;
}

function getActivityContent(activity: ActivityLog) {
  const meta = activity.metadata;
  switch (activity.type) {
    case "movie_watched":
      return {
        icon: Eye,
        text: (
          <>
            assistiu <span className="text-gold font-medium">{String(meta.movieTitle ?? "um filme")}</span>
          </>
        ),
      };
    case "list_created":
      return {
        icon: List,
        text: (
          <>
            criou a lista <span className="text-gold font-medium">{String(meta.listName ?? "")}</span>
          </>
        ),
      };
    default:
      return { icon: Film, text: " realizou uma ação" };
  }
}

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "agora";
  if (mins < 60) return `${mins}min atrás`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h atrás`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d atrás`;
  return new Date(dateStr).toLocaleDateString("pt-BR");
}

export function ActivityItem({ activity }: ActivityItemProps) {
  const { icon: Icon, text } = getActivityContent(activity);
  const displayName = activity.user.username
    ? `@${activity.user.username}`
    : activity.user.name;
  const reviewId =
    activity.type === "movie_watched" && activity.metadata.reviewId
      ? String(activity.metadata.reviewId)
      : null;

  const content = (
    <div
      className={cn(
        "flex items-start gap-3 p-4 rounded-2xl glass border border-white/6",
        "transition-colors hover:border-gold/20",
        reviewId && "cursor-pointer"
      )}
      data-slot="activity-item"
    >
      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gold/10 border border-gold/20">
        <Icon className="size-4 text-gold" />
      </div>
      <div className="flex-1 min-w-0 space-y-0.5">
        <p className="font-sans text-sm text-foreground leading-relaxed">
          <span className="font-medium">{displayName}</span> {text}
        </p>
        <p className="font-sans text-xs text-muted-foreground">
          {formatRelativeTime(activity.createdAt)}
          {reviewId && <span className="text-gold"> · Ver review</span>}
        </p>
      </div>
    </div>
  );

  if (reviewId) {
    return <Link href={`/reviews/${reviewId}`}>{content}</Link>;
  }

  return content;
}
