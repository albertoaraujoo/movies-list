"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { getUnreadNotificationsCountAction } from "@/actions/notification-actions";
import { cn } from "@/lib/utils";

const POLL_INTERVAL_MS = 60_000;

export function NotificationBell() {
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);
  const isActive = pathname === "/notifications";

  const refreshCount = useCallback(async () => {
    try {
      const count = await getUnreadNotificationsCountAction();
      setUnreadCount(count);
    } catch {
      setUnreadCount(0);
    }
  }, []);

  useEffect(() => {
    refreshCount();
  }, [refreshCount, pathname]);

  useEffect(() => {
    const interval = setInterval(refreshCount, POLL_INTERVAL_MS);
    const onFocus = () => refreshCount();
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [refreshCount]);

  const displayCount = unreadCount > 99 ? "99+" : String(unreadCount);

  return (
    <Link
      href="/notifications"
      aria-label={
        unreadCount > 0
          ? `Notificações, ${unreadCount} não lidas`
          : "Notificações"
      }
      className={cn(
        "relative flex items-center justify-center size-10 rounded-xl transition-colors",
        isActive
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
    </Link>
  );
}
