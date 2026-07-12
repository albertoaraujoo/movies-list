import Link from "next/link";
import { auth } from "@/auth";
import { getListAction } from "@/actions/list-actions";
import { ListDetailActions } from "@/components/lists/list-detail-actions";
import { ListMoviesGrid } from "@/components/lists/list-movies-grid";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ListDetailPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();
  if (!session?.accessToken) return null;

  const list = await getListAction(id).catch(() => null);
  if (!list) notFound();

  const movieCount = list.items?.length ?? list._count?.items ?? 0;
  const existingMovieIds = list.items?.map((item) => item.movieId) ?? [];

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 font-sans text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" />
        Voltar
      </Link>

      <div className="space-y-4">
        <div className="space-y-2">
          <h1 className="font-display tracking-wider uppercase text-[clamp(1.75rem,4vw,3rem)] leading-none text-foreground">
            {list.name}
          </h1>
          {list.description && (
            <p className="font-sans text-sm text-muted-foreground mt-1.5 leading-relaxed">
              {list.description}
            </p>
          )}
          <p className="font-sans text-sm text-muted-foreground leading-relaxed">
            {movieCount} {movieCount === 1 ? "filme" : "filmes"} nesta lista
          </p>
          <div className="flex gap-2 flex-wrap">
            {list.isDefault && (
              <span className="px-2 py-0.5 rounded-full text-xs bg-gold/20 text-gold border border-gold/30">
                Minha Lista
              </span>
            )}
            {list.isFavorites && (
              <span className="px-2 py-0.5 rounded-full text-xs bg-gold/20 text-gold border border-gold/30">
                Favoritos
              </span>
            )}
            {list.isNumbered && (
              <span className="px-2 py-0.5 rounded-full text-xs bg-surface-raised border border-border text-muted-foreground">
                Numerada
              </span>
            )}
            {list.isRanked && (
              <span className="px-2 py-0.5 rounded-full text-xs bg-surface-raised border border-border text-muted-foreground">
                Ranking
              </span>
            )}
          </div>
        </div>

        <ListDetailActions list={list} excludeMovieIds={existingMovieIds} />      </div>

      <ListMoviesGrid list={list} />
    </div>
  );
}
