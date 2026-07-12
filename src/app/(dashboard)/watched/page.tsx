import { auth } from "@/auth";
import { getMovies } from "@/lib/api";
import { WatchedPageContent } from "@/components/watched-page-content";

export default async function WatchedPage() {
  const session = await auth();
  if (!session?.accessToken) return null;

  const response = await getMovies({ watched: true, limit: 100 }, session.accessToken).catch(
    () => ({ data: [], meta: { total: 0, page: 1, limit: 100, totalPages: 0 } })
  );

  const movies = response.data;

  return <WatchedPageContent movies={movies} />;
}
