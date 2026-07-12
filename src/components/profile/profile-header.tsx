"use client";

import Image from "next/image";
import Link from "next/link";
import { User } from "lucide-react";
import type { PublicUserProfile, UserProfile } from "@/lib/types";

interface ProfileHeaderProps {
  profile: UserProfile | PublicUserProfile;
  isOwn?: boolean;
}

export function ProfileHeader({ profile, isOwn }: ProfileHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 p-5 rounded-2xl glass border border-white/6">
      <div className="relative shrink-0">
        <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-gold/30 bg-neutral-800">
          {profile.image ? (
            <Image
              src={profile.image}
              alt={profile.name}
              fill
              sizes="80px"
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gold/10">
              <User className="size-8 text-gold" />
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 text-center sm:text-left space-y-1 min-w-0">
        <h1 className="font-display tracking-wider uppercase text-2xl text-foreground truncate">
          {profile.name}
        </h1>
        {"username" in profile && profile.username && (
          <p className="font-sans text-sm text-gold">@{profile.username}</p>
        )}
        {isOwn && "email" in profile && (
          <p className="font-sans text-xs text-muted-foreground truncate">{profile.email}</p>
        )}
      </div>

      <div className="flex items-center gap-3 flex-wrap justify-center sm:justify-end">
        <StatBadge label="Assistidos" value={profile.watchedMovies} />
        <StatBadge label="Listas" value={profile.listsCount} />
        <StatBadge label="Seguidores" value={profile.followersCount} />
        <StatBadge label="Seguindo" value={profile.followingCount} />
      </div>
    </div>
  );
}

function StatBadge({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col items-center px-3 py-2 rounded-xl border border-white/6 bg-surface-raised/50 min-w-[72px]">
      <span className="font-display text-lg leading-none text-foreground">{value}</span>
      <span className="font-sans text-[0.65rem] text-muted-foreground mt-0.5">{label}</span>
    </div>
  );
}
