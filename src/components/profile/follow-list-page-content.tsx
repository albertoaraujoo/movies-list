"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { BackLink } from "@/components/back-link";
import { FollowUserRow } from "@/components/profile/follow-user-row";
import { Button } from "@/components/ui/button";
import { getFollowersAction, getFollowingAction } from "@/actions/user-actions";
import type { FollowUser } from "@/lib/types";

interface FollowListPageContentProps {
  userId: string;
  type: "followers" | "following";
  returnHref: string;
  returnLabel?: string;
}

export function FollowListPageContent({
  userId,
  type,
  returnHref,
  returnLabel = "Voltar",
}: FollowListPageContentProps) {
  const [users, setUsers] = useState<FollowUser[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, startLoadMore] = useTransition();

  const title = type === "followers" ? "Seguidores" : "Seguindo";
  const limit = 20;

  const loadPage = useCallback(
    async (pageNum: number, append = false) => {
      const result =
        type === "followers"
          ? await getFollowersAction(userId, pageNum, limit)
          : await getFollowingAction(userId, pageNum, limit);

      setUsers((prev) => (append ? [...prev, ...result.data] : result.data));
      setTotal(result.meta.total);
      setPage(pageNum);
    },
    [userId, type]
  );

  useEffect(() => {
    setLoading(true);
    loadPage(1)
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, [loadPage]);

  const hasMore = users.length < total;

  return (
    <div className="space-y-6">
      <BackLink href={returnHref} label={returnLabel} />

      <div>
        <h1 className="font-display tracking-wider uppercase text-2xl sm:text-3xl text-foreground">
          {title}
        </h1>
        <p className="font-sans text-sm text-muted-foreground mt-1">
          {total} {total === 1 ? "pessoa" : "pessoas"}
        </p>
      </div>

      {loading ? (
        <p className="font-sans text-sm text-muted-foreground py-8 text-center">Carregando...</p>
      ) : users.length === 0 ? (
        <p className="font-sans text-sm text-muted-foreground py-8 text-center">
          {type === "followers" ? "Nenhum seguidor ainda." : "Não segue ninguém ainda."}
        </p>
      ) : (
        <div className="space-y-3">
          {users.map((user) => (
            <FollowUserRow
              key={user.id}
              user={user}
              listType={type}
              variant="detailed"
              onUpdate={() => loadPage(1)}
            />
          ))}
          {hasMore && (
            <div className="flex justify-center pt-2">
              <Button
                variant="outline"
                disabled={loadingMore}
                onClick={() =>
                  startLoadMore(async () => {
                    await loadPage(page + 1, true);
                  })
                }
              >
                {loadingMore ? "Carregando..." : "Carregar mais"}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
