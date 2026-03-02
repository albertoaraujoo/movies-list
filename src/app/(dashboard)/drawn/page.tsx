import { Metadata } from "next";
import { Shuffle } from "lucide-react";
import { auth } from "@/auth";
import { getDrawnMovies } from "@/lib/api";
import { DrawnMoviesList } from "@/components/drawn-movies-list";
import { DrawButton } from "@/components/draw-button";

export const metadata: Metadata = {
  title: "Filmes Sorteados",
};

export default async function DrawnMoviesPage() {
  const session = await auth();
  const initialItems = session?.accessToken
    ? await getDrawnMovies(session.accessToken).catch(() => [])
    : [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <Shuffle className="size-6 text-gold shrink-0" />
            <h1 className="font-display tracking-wider uppercase text-[clamp(1.75rem,4vw,3rem)] leading-none text-foreground">
              Sorteados
            </h1>
          </div>
          <p className="font-sans text-sm text-muted-foreground mt-2 leading-relaxed">
            Fila de filmes sorteados aleatoriamente para assistir
          </p>
        </div>

        <DrawButton />
      </div>

      {/* Conteúdo centralizado */}
      <div className="flex flex-col items-center w-full">
        {/* Explicação */}
        <div className="w-full max-w-2xl glass border border-white/6 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🎲</span>
            <div>
              <p className="font-sans text-sm font-medium text-foreground">
                Como funciona o sorteio
              </p>
              <p className="font-sans text-xs text-muted-foreground mt-1 leading-relaxed">
                Ao clicar em &quot;Sortear Filme&quot;, um filme aleatório da sua lista (ainda não
                assistido) é adicionado à fila. A lista pode ter até 30 filmes. Ao marcar um
                filme como{" "}
                <strong className="text-foreground">assistido</strong>, ele é automaticamente
                removido da fila.
              </p>
            </div>
          </div>
        </div>

        {/* Lista */}
        <div className="w-full max-w-2xl mt-6">
          <DrawnMoviesList initialItems={initialItems} />
        </div>
      </div>
    </div>
  );
}
