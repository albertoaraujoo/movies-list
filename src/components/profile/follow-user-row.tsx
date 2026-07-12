"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { User } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { followUserAction, unfollowUserAction } from "@/actions/user-actions";
import type { FollowUser } from "@/lib/types";
import { cn } from "@/lib/utils";

interface FollowUserRowProps {
  user: FollowUser;
  listType: "followers" | "following";
  variant?: "compact" | "detailed";
  onUpdate?: () => void;
}

export function FollowUserRow({
  user,
  listType,
  variant = "compact",
  onUpdate,
}: FollowUserRowProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const profileHref = user.username ? `/users/${user.username}` : "#";
  const isFollowing = user.isFollowing ?? false;
  const followsYou = user.followsYou ?? false;

  function getActionLabel() {
    if (listType === "following") return "Deixar de seguir";
    if (isFollowing) return "Deixar de seguir";
    if (followsYou) return "Seguir de volta";
    return "Seguir";
  }

  function handleAction(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    startTransition(async () => {
      try {
        if (isFollowing) {
          await unfollowUserAction(user.id);
          toast.success("Deixou de seguir");
        } else {
          await followUserAction(user.id);
          toast.success(followsYou ? "Seguindo de volta!" : "Seguindo!");
        }
        onUpdate?.();
        router.refresh();
      } catch {
        toast.error("Erro ao atualizar follow");
      }
    });
  }

  const showAction = user.id !== undefined;

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl border border-white/6 bg-neutral-900 transition-colors hover:border-gold/20",
        variant === "detailed" ? "p-4" : "p-3"
      )}
      data-slot="follow-user-row"
    >
      <Link href={profileHref} className="flex flex-1 items-center gap-3 min-w-0">
        <div className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-neutral-800">
          {user.image ? (
            <Image
              src={user.image}
              alt={user.name}
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
        <div className="min-w-0 flex-1">
          <p className="truncate font-sans text-sm font-medium text-foreground">{user.name}</p>
          {user.username && (
            <p className="truncate font-sans text-xs text-gold">@{user.username}</p>
          )}
          {variant === "detailed" && (
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {followsYou && !isFollowing && (
                <Badge variant="outline" className="border-gold/30 text-gold bg-gold/10 text-[10px]">
                  Te segue
                </Badge>
              )}
              {isFollowing && followsYou && (
                <Badge variant="outline" className="border-gold/30 text-gold bg-gold/10 text-[10px]">
                  Seguem um ao outro
                </Badge>
              )}
              {isFollowing && !followsYou && (
                <Badge variant="outline" className="text-[10px]">
                  Você segue
                </Badge>
              )}
            </div>
          )}
        </div>
      </Link>
      {showAction && (
        <Button
          size="sm"
          variant={isFollowing ? "outline" : "default"}
          disabled={isPending}
          onClick={handleAction}
          className="shrink-0"
        >
          {getActionLabel()}
        </Button>
      )}
    </div>
  );
}
