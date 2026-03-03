import { Metadata } from "next";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { getMovie } from "@/lib/api";
import { MovieDetailContent } from "@/components/movie-detail-content";

export const metadata: Metadata = {
  title: "Detalhes do filme",
  description: "Sinopse, duração e onde assistir",
};

export default async function MovieDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.accessToken) notFound();

  const { id } = await params;
  const movie = await getMovie(id, session.accessToken).catch(() => null);
  if (!movie) notFound();

  return <MovieDetailContent movie={movie} />;
}
