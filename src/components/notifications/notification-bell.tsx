"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Bell } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { NotificationItemCard } from "@/components/notifications/notification-item-card";
import {
  getNotificationsAction,
  getUnreadNotificationsCountAction,
} from "@/actions/notification-actions";
import type { NotificationItem } from "@/lib/types";
import { cn } from "@/lib/utils";

const POLL_INTERVAL_MS = 60_000;
const PREVIEW_LIMIT = 5;

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshCount = useCallback(async () => {
    try {
      const count = await getUnreadNotificationsCountAction();
      setUnreadCount(count);
    } catch {
      setUnreadCount(0);
    }
  }, []);

  const loadPreview = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getNotificationsAction(1);
      setNotifications(result.data.slice(0, PREVIEW_LIMIT));
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCount();
  }, [refreshCount]);

  useEffect(() => {
    const interval = setInterval(refreshCount, POLL_INTERVAL_MS);
    const onFocus = () => refreshCount();
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [refreshCount]);

  useEffect(() => {
    if (open) {
      loadPreview();
      refreshCount();
    }
  }, [open, loadPreview, refreshCount]);

  const displayCount = unreadCount > 99 ? "99+" : String(unreadCount);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={
          unreadCount > 0
            ? `Notificações, ${unreadCount} não lidas`
            : "Notificações"
        }
        className={cn(
          "relative flex items-center justify-center size-10 rounded-xl transition-colors",
          open
            ? "text-foreground bg-white/6 border border-white/8"
            : "text-muted-foreground hover:text-foreground hover:bg-white/5"
        )}
        data-slot="notification-bell"
      >
        <Bell className="size-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex min-w-[18px] h-[18px] items-center justify-center rounded-full bg-gold px-1 text-[10px] font-semibold text-neutral-950">
            {displayCount}
          </span>
        )}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-neutral-950 border-white/10 sm:max-w-md max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="font-display tracking-wider uppercase">
              Notificações
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-2 min-h-0 py-1">
            {loading ? (
              <p className="font-sans text-sm text-muted-foreground py-6 text-center">
                Carregando...
              </p>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center py-10 text-center space-y-3">
                <Bell className="size-8 text-muted-foreground" />
                <p className="font-sans text-sm text-muted-foreground">
                  Nenhuma notificação ainda.
                </p>
              </div>
            ) : (
              notifications.map((notification) => (
                <NotificationItemCard
                  key={notification.id}
                  notification={notification}
                  compact
                  onUpdate={() => {
                    loadPreview();
                    refreshCount();
                  }}
                />
              ))
            )}
          </div>

          <div className="pt-2 border-t border-white/6">
            <Button asChild variant="outline" className="w-full">
              <Link href="/notifications" onClick={() => setOpen(false)}>
                Ver tudo
              </Link>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
