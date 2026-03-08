import { auth } from "@/auth";
import { getMovies } from "@/lib/api";
import { MovieGrid } from "@/components/movie-grid";

export async function MovieListSection() {
  const session = await auth();
  const initialData =
    session?.accessToken
      ? await getMovies({ page: 1, limit: 24 }, session.accessToken).catch(
          () => null
        )
      : null;

  return (
    <>
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
      </div>
      <MovieGrid initialData={initialData} />
    </>
  );
}
