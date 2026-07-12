"use client";

import { FollowUserRow } from "@/components/profile/follow-user-row";
import type { FollowUser } from "@/lib/types";

interface FollowTabsProps {
  followers: FollowUser[];
  following: FollowUser[];
  onUpdate?: () => void;
}

export function FollowTabs({ followers, following, onUpdate }: FollowTabsProps) {
  return (
    <div className="space-y-6" data-slot="follow-tabs">
      <section className="space-y-3">
        <h2 className="font-display tracking-wider uppercase text-sm text-foreground">
          Seguidores ({followers.length})
        </h2>
        {followers.length === 0 ? (
          <p className="font-sans text-sm text-muted-foreground">Nenhum seguidor ainda.</p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {followers.map((u) => (
              <FollowUserRow
                key={u.id}
                user={u}
                listType="followers"
                variant="detailed"
                onUpdate={onUpdate}
              />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-display tracking-wider uppercase text-sm text-foreground">
          Seguindo ({following.length})
        </h2>
        {following.length === 0 ? (
          <p className="font-sans text-sm text-muted-foreground">Não segue ninguém ainda.</p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {following.map((u) => (
              <FollowUserRow
                key={u.id}
                user={u}
                listType="following"
                variant="detailed"
                onUpdate={onUpdate}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
