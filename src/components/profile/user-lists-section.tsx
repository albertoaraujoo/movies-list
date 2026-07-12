import Link from "next/link";
import { Layers } from "lucide-react";
import { auth } from "@/auth";
import { getListsAction } from "@/actions/list-actions";

interface UserListsSectionProps {
  /** Oculta a lista principal (útil no dashboard, que já exibe ela) */
  hideDefault?: boolean;
  title?: string;
}

export async function UserListsSection({
  hideDefault = false,
  title = "Suas Listas",
}: UserListsSectionProps) {
  const session = await auth();
  if (!session?.accessToken) return null;

  const lists = await getListsAction().catch(() => []);
  const visible = hideDefault ? lists.filter((list) => !list.isDefault) : lists;

  if (visible.length === 0) return null;

  return (
    <section className="space-y-3" data-slot="user-lists-section">
      <div className="flex items-center gap-2">
        <Layers className="size-4 text-gold" />
        <h2 className="font-display tracking-wider uppercase text-sm text-foreground">
          {title}
        </h2>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:overflow-visible">
        {visible.map((list) => (
          <Link
            key={list.id}
            href={`/lists/${list.id}`}
            className="min-w-[200px] sm:min-w-0 p-4 rounded-2xl border border-white/6 bg-neutral-900/50 hover:border-gold/30 transition-colors space-y-1 shrink-0"
          >
            <p className="font-display tracking-wider uppercase text-sm text-foreground truncate">
              {list.name}
            </p>
            {list.description && (
              <p className="font-sans text-xs text-muted-foreground line-clamp-2">
                {list.description}
              </p>
            )}
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              <span className="font-sans text-xs text-gold">
                {list._count?.items ?? 0} filme(s)
              </span>
              {list.isDefault && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-gold/20 text-gold border border-gold/30">
                  Principal
                </span>
              )}
              {list.isFavorites && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-gold/20 text-gold border border-gold/30">
                  Favoritos
                </span>
              )}
              {list.isNumbered && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-surface-raised border border-border text-muted-foreground">
                  Numerada
                </span>
              )}
              {list.isRanked && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-surface-raised border border-border text-muted-foreground">
                  Ranking
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}