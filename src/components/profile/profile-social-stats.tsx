"use client";

import { useState } from "react";
import { FollowListModal } from "@/components/profile/follow-list-modal";
import { cn } from "@/lib/utils";

interface ProfileSocialStatsProps {
  userId: string;
  username?: string | null;
  followersCount: number;
  followingCount: number;
  watchedMovies?: number;
  listsCount?: number;
  showMediaStats?: boolean;
}

export function ProfileSocialStats({
  userId,
  username,
  followersCount,
  followingCount,
  watchedMovies,
  listsCount,
  showMediaStats = true,
}: ProfileSocialStatsProps) {
  const [modalType, setModalType] = useState<"followers" | "following" | null>(null);

  return (
    <>
      <div className="flex items-center gap-3 flex-wrap justify-center sm:justify-end">
        {showMediaStats && watchedMovies != null && (
          <StatBadge label="Assistidos" value={watchedMovies} />
        )}
        {showMediaStats && listsCount != null && (
          <StatBadge label="Listas" value={listsCount} />
        )}
        <StatBadge
          label="Seguidores"
          value={followersCount}
          onClick={() => setModalType("followers")}
          interactive
        />
        <StatBadge
          label="Seguindo"
          value={followingCount}
          onClick={() => setModalType("following")}
          interactive
        />
      </div>

      {modalType && (
        <FollowListModal
          open={!!modalType}
          onOpenChange={(open) => !open && setModalType(null)}
          userId={userId}
          username={username}
          type={modalType}
        />
      )}
    </>
  );
}

function StatBadge({
  label,
  value,
  onClick,
  interactive,
}: {
  label: string;
  value: number;
  onClick?: () => void;
  interactive?: boolean;
}) {
  const className = cn(
    "flex flex-col items-center px-3 py-2 rounded-xl border border-white/6 bg-surface-raised/50 min-w-[72px]",
    interactive && "cursor-pointer hover:border-gold/30 transition-colors"
  );

  if (interactive && onClick) {
    return (
      <button type="button" onClick={onClick} className={className}>
        <span className="font-display text-lg leading-none text-foreground">{value}</span>
        <span className="font-sans text-[0.65rem] text-muted-foreground mt-0.5">{label}</span>
      </button>
    );
  }

  return (
    <div className={className}>
      <span className="font-display text-lg leading-none text-foreground">{value}</span>
      <span className="font-sans text-[0.65rem] text-muted-foreground mt-0.5">{label}</span>
    </div>
  );
}
