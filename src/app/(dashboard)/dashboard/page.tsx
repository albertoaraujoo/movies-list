import { Metadata } from "next";
import { auth } from "@/auth";
import { getMovies } from "@/lib/api";
import { MovieGrid } from "@/components/movie-grid";
import { AddMovieDialog } from "@/components/add-movie-dialog";
import { DrawButton } from "@/components/draw-button";
import { ProfilePanel } from "@/components/dashboard/profile-panel";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const session = await auth();
  const initialData = session?.accessToken
    ? await getMovies(
        { page: 1, limit: 24, watched: false },
        session.accessToken
      ).catch(() => null)
    : null;

  return (
    <div className="space-y-8">
      {/* Painel de perfil */}
      <ProfilePanel />

      {/* Cabeçalho com ações */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display tracking-wider uppercase text-[clamp(1.75rem,4vw,3rem)] leading-none text-foreground">
            Minha Lista
          </h1>
          <p className="font-sans text-sm text-muted-foreground mt-1.5 leading-relaxed">
            {initialData?.meta
              ? `${initialData.meta.total} ${initialData.meta.total === 1 ? "filme" : "filmes"} na sua lista`
              : "Gerencie os filmes que você quer assistir"}
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <DrawButton />
          <AddMovieDialog />
        </div>
      </div>

      {/* Grid de filmes — initialData alinhado a watched: false para primeiro paint sem opacidade */}
      <MovieGrid initialData={initialData} />
    </div>
  );
}
