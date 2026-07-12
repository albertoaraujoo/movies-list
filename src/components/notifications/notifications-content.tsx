"use client";

import { useCallback, useState, useTransition } from "react";
import { Bell } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { NotificationItem } from "@/lib/types";
import { NotificationItemCard } from "@/components/notifications/notification-item-card";
import {
  getNotificationsAction,
  markAllNotificationsAsReadAction,
} from "@/actions/notification-actions";

interface NotificationsContentProps {
  initialNotifications: NotificationItem[];
  initialTotal: number;
}

export function NotificationsContent({
  initialNotifications,
  initialTotal,
}: NotificationsContentProps) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const refresh = useCallback(async () => {
    const result = await getNotificationsAction(1);
    setNotifications(result.data);
    setTotal(result.meta.total);
    setPage(1);
  }, []);

  function handleMarkAllRead() {
    startTransition(async () => {
      try {
        await markAllNotificationsAsReadAction();
        await refresh();
        toast.success("Todas as notificações foram marcadas como lidas");
      } catch {
        toast.error("Erro ao marcar notificações");
      }
    });
  }

  function handleLoadMore() {
    setIsLoadingMore(true);
    getNotificationsAction(page + 1)
      .then((result) => {
        setNotifications((prev) => [...prev, ...result.data]);
        setPage((p) => p + 1);
        setTotal(result.meta.total);
      })
      .catch(() => toast.error("Erro ao carregar notificações"))
      .finally(() => setIsLoadingMore(false));
  }

  const hasUnread = notifications.some((n) => !n.readAt);
  const hasMore = notifications.length < total;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display tracking-wider uppercase text-2xl sm:text-3xl text-foreground">
            Notificações
          </h1>
          <p className="font-sans text-sm text-muted-foreground mt-1">
            Veja quem interagiu com você
          </p>
        </div>
        {hasUnread && (
          <Button
            variant="outline"
            size="sm"
            disabled={isPending}
            onClick={handleMarkAllRead}
            className="shrink-0"
          >
            Marcar todas como lidas
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-surface-raised border border-border">
            <Bell className="size-8 text-muted-foreground" />
          </div>
          <h2 className="font-display tracking-wider uppercase text-lg text-foreground">
            Nenhuma notificação
          </h2>
          <p className="font-sans text-sm text-muted-foreground max-w-sm">
            Quando alguém te seguir, você verá aqui.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <NotificationItemCard
              key={notification.id}
              notification={notification}
              onUpdate={refresh}
            />
          ))}
          {hasMore && (
            <div className="flex justify-center pt-2">
              <Button
                variant="outline"
                size="sm"
                disabled={isLoadingMore}
                onClick={handleLoadMore}
              >
                {isLoadingMore ? "Carregando..." : "Carregar mais"}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
