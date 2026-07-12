"use client";

import { useTransition } from "react";
import { Lock } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BackLink } from "@/components/back-link";
import { ProfileHeader } from "@/components/profile/profile-header";
import { FollowTabs } from "@/components/profile/follow-tabs";
import {
  followUserAction,
  unfollowUserAction,
  getFollowersAction,
  getFollowingAction,
} from "@/actions/user-actions";
import type { PublicUserProfile, FollowUser, Review } from "@/lib/types";
import { ReviewPreviewCard } from "@/components/reviews/review-preview-card";
import { useEffect, useState } from "react";

interface PublicProfileContentProps {
  profile: PublicUserProfile | null;
  isPrivate: boolean;
  isOwn: boolean;
  reviews?: Review[];
  returnHref?: string;
}

export function PublicProfileContent({
  profile,
  isPrivate,
  isOwn,
  reviews = [],
  returnHref = "/dashboard",
}: PublicProfileContentProps) {
  const [isPending, startTransition] = useTransition();
  const [followers, setFollowers] = useState<FollowUser[]>([]);
  const [following, setFollowing] = useState<FollowUser[]>([]);
  const [isFollowing, setIsFollowing] = useState(profile?.isFollowing ?? false);
  const [isMutual, setIsMutual] = useState(profile?.isMutual ?? false);
  const followsYou = profile?.followsYou ?? false;

  useEffect(() => {
    if (!profile) return;
    Promise.all([
      getFollowersAction(profile.id),
      getFollowingAction(profile.id),
    ]).then(([f, fg]) => {
      setFollowers(f.data);
      setFollowing(fg.data);
    });
  }, [profile]);

  if (isPrivate) {
    return (
      <div className="space-y-6">
        <BackLink href={returnHref} label={isOwn ? "Voltar ao perfil" : "Voltar"} />
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-surface-raised border border-border">
          <Lock className="size-8 text-muted-foreground" />
        </div>
        <h1 className="font-display tracking-wider uppercase text-xl text-foreground">
          Perfil Privado
        </h1>
        <p className="font-sans text-sm text-muted-foreground max-w-sm">
          Este usuário configurou o perfil como privado ou você não tem permissão para visualizá-lo.
        </p>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  function handleFollowToggle() {
    startTransition(async () => {
      try {
        if (isFollowing) {
          await unfollowUserAction(profile!.id);
          setIsFollowing(false);
          setIsMutual(false);
          toast.success("Deixou de seguir");
        } else {
          await followUserAction(profile!.id);
          setIsFollowing(true);
          setIsMutual(followsYou);
          toast.success(followsYou ? "Seguindo de volta!" : "Seguindo!");
        }
      } catch {
        toast.error("Erro ao atualizar follow");
      }
    });
  }

  function getFollowButtonLabel() {
    if (isFollowing) return "Deixar de seguir";
    if (followsYou) return "Seguir de volta";
    return "Seguir";
  }

  return (
    <div className="space-y-8">
      <BackLink href={returnHref} label={isOwn ? "Voltar ao perfil" : "Voltar"} />
      <ProfileHeader profile={profile} isOwn={isOwn} />

      {!isOwn && (
        <div className="flex flex-wrap items-center gap-3">
          {followsYou && !isFollowing && (
            <Badge variant="outline" className="border-gold/30 text-gold bg-gold/10">
              Te segue
            </Badge>
          )}
          {isFollowing && isMutual && (
            <Badge variant="outline" className="border-gold/30 text-gold bg-gold/10">
              Seguem um ao outro
            </Badge>
          )}
          <Button
            onClick={handleFollowToggle}
            disabled={isPending}
            variant={isFollowing ? "outline" : "default"}
            className="gap-2"
          >
            {getFollowButtonLabel()}
          </Button>
        </div>
      )}

      <FollowTabs followers={followers} following={following} />

      {reviews.length > 0 && (
        <section className="space-y-3" data-slot="public-reviews-section">
          <h2 className="font-display tracking-wider uppercase text-sm text-foreground">
            Reviews
          </h2>
          <div className="grid gap-3">
            {reviews.map((review) => (
              <ReviewPreviewCard
                key={review.id}
                review={review}
                showLike={!isOwn}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
