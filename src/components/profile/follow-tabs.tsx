"use client";

import Image from "next/image";
import Link from "next/link";
import { User } from "lucide-react";
import type { FollowUser } from "@/lib/types";

interface FollowTabsProps {
  followers: FollowUser[];
  following: FollowUser[];
}

function UserCard({ user }: { user: FollowUser }) {
  const href = user.username ? `/users/${user.username}` : "#";

  return (
    <Link
      href={href}
      className="flex items-center gap-3 p-3 rounded-xl border border-white/6 bg-surface-raised/40 hover:border-gold/30 transition-colors"
    >
      <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-neutral-800 shrink-0">
        {user.image ? (
          <Image src={user.image} alt={user.name} fill sizes="40px" className="object-cover" unoptimized />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gold/10">
            <User className="size-4 text-gold" />
          </div>
        )}
      </div>
      <div className="min-w-0">
        <p className="font-sans text-sm font-medium text-foreground truncate">{user.name}</p>
        {user.username && (
          <p className="font-sans text-xs text-gold truncate">@{user.username}</p>
        )}
      </div>
    </Link>
  );
}

export function FollowTabs({ followers, following }: FollowTabsProps) {
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
              <UserCard key={u.id} user={u} />
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
              <UserCard key={u.id} user={u} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
