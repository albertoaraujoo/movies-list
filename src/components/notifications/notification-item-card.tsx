"use client";

import Link from "next/link";
import Image from "next/image";
import { useTransition } from "react";
import { UserPlus, User } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { formatRelativeTime } from "@/lib/format-relative-time";
import type { NotificationItem } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  followUserFromNotificationAction,
  markNotificationAsReadAction,
} from "@/actions/notification-actions";

interface NotificationItemCardProps {
  notification: NotificationItem;
  compact?: boolean;
  onUpdate?: () => void;
}

export function NotificationItemCard({ notification, compact, onUpdate }: NotificationItemCardProps) {
  const [isPending, startTransition] = useTransition();
  const { actor } = notification;
  const profileHref = actor.username ? `/users/${actor.username}` : "/dashboard";
  const displayName = actor.username ? `@${actor.username}` : actor.name;
  const isUnread = !notification.readAt;
  const showFollowBack =
    notification.type === "user_followed" && !notification.isFollowingActor;

  function handleMarkRead() {
    if (!isUnread) return;
    startTransition(async () => {
      try {
        await markNotificationAsReadAction(notification.id);
        onUpdate?.();
      } catch {
        toast.error("Erro ao marcar notificação");
      }
    });
  }

  function handleFollowBack(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    startTransition(async () => {
      try {
        await followUserFromNotificationAction(actor.id);
        toast.success("Seguindo de volta!");
        onUpdate?.();
      } catch {
        toast.error("Erro ao seguir");
      }
    });
  }

  return (
    <Link
      href={profileHref}
      onClick={handleMarkRead}
      className={cn(
        "flex items-start gap-3 rounded-2xl border transition-colors hover:border-gold/20",
        compact ? "p-3 bg-neutral-900 border-white/6" : "p-4 glass",
        isUnread ? "border-gold/30 bg-gold/5" : compact ? "border-white/6" : "border-white/6"
      )}
      data-slot="notification-item"
    >
      <div className="relative shrink-0">
        <div className="relative size-10 rounded-xl overflow-hidden border border-white/10 bg-surface-raised">
          {actor.image ? (
            <Image
              src={actor.image}
              alt={actor.name}
              fill
              sizes="40px"
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gold/10">
              <User className="size-4 text-gold" />
            </div>
          )}
        </div>
        <div className="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full bg-gold/20 border border-gold/30">
          <UserPlus className="size-2.5 text-gold" />
        </div>
      </div>

      <div className="flex-1 min-w-0 space-y-1">
        <p className="font-sans text-sm text-foreground leading-relaxed">
          <span className="font-medium">{displayName}</span>{" "}
          <span className="text-muted-foreground">começou a te seguir</span>
        </p>
        <p className="font-sans text-xs text-muted-foreground">
          {formatRelativeTime(notification.createdAt)}
          {isUnread && <span className="text-gold"> · Nova</span>}
        </p>
      </div>

      {showFollowBack && (
        <Button
          size="sm"
          disabled={isPending}
          onClick={handleFollowBack}
          className="shrink-0"
        >
          Seguir de volta
        </Button>
      )}
    </Link>
  );
}
