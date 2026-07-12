"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FollowUserRow } from "@/components/profile/follow-user-row";
import { getFollowersAction, getFollowingAction } from "@/actions/user-actions";
import type { FollowUser } from "@/lib/types";

const PREVIEW_LIMIT = 5;

interface FollowListModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  username?: string | null;
  type: "followers" | "following";
}

export function FollowListModal({
  open,
  onOpenChange,
  userId,
  username,
  type,
}: FollowListModalProps) {
  const [users, setUsers] = useState<FollowUser[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const title = type === "followers" ? "Seguidores" : "Seguindo";
  const fullPageHref =
    username != null
      ? `/users/${username}/${type}`
      : `/profile/${type}`;

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const result =
        type === "followers"
          ? await getFollowersAction(userId, 1, PREVIEW_LIMIT)
          : await getFollowingAction(userId, 1, PREVIEW_LIMIT);
      setUsers(result.data);
      setTotal(result.meta.total);
    } catch {
      setUsers([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [userId, type]);

  useEffect(() => {
    if (open) loadUsers();
  }, [open, loadUsers]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-neutral-950 border-white/10 sm:max-w-md max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-display tracking-wider uppercase">
            {title}
            {total > 0 && (
              <span className="ml-2 text-muted-foreground font-sans text-sm normal-case">
                ({total})
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-2 min-h-0 py-1">
          {loading ? (
            <p className="font-sans text-sm text-muted-foreground py-6 text-center">
              Carregando...
            </p>
          ) : users.length === 0 ? (
            <p className="font-sans text-sm text-muted-foreground py-6 text-center">
              {type === "followers" ? "Nenhum seguidor ainda." : "Não segue ninguém ainda."}
            </p>
          ) : (
            users.map((user) => (
              <FollowUserRow
                key={user.id}
                user={user}
                listType={type}
                onUpdate={loadUsers}
              />
            ))
          )}
        </div>

        {total > PREVIEW_LIMIT && (
          <div className="pt-2 border-t border-white/6">
            <Button asChild variant="outline" className="w-full">
              <Link href={fullPageHref} onClick={() => onOpenChange(false)}>
                Ver tudo ({total})
              </Link>
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
