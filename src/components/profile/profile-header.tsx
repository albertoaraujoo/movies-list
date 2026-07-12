"use client";

import Image from "next/image";
import { User } from "lucide-react";
import { ProfileSocialStats } from "@/components/profile/profile-social-stats";
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
        {profile.bio && (
          <p className="font-sans text-sm text-muted-foreground whitespace-pre-wrap break-words max-w-prose">
            {profile.bio}
          </p>
        )}
        {isOwn && "email" in profile && (
          <p className="font-sans text-xs text-muted-foreground truncate">{profile.email}</p>
        )}
      </div>

      <ProfileSocialStats
        userId={profile.id}
        username={"username" in profile ? profile.username : null}
        followersCount={profile.followersCount}
        followingCount={profile.followingCount}
        watchedMovies={profile.watchedMovies}
        listsCount={profile.listsCount}
      />
    </div>
  );
}
