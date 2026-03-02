import { NextRequest, NextResponse } from "next/server";
import type { TmdbMovie, TmdbSearchResponse } from "@/lib/types";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q");

  if (!query?.trim()) {
    return NextResponse.json([]);
  }

  const accessToken = process.env.TMDB_READ_ACCESS_TOKEN;

  if (!accessToken) {
    return NextResponse.json(
      { error: "TMDB token não configurado" },
      { status: 500 }
    );
  }

  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(query)}&language=pt-BR&page=1`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
        next: { revalidate: 300 },
      }
    );

    if (!res.ok) {
      return NextResponse.json([]);
    }

    const data: TmdbSearchResponse = await res.json();

    const movies = data.results.slice(0, 8).map((m: TmdbMovie) => ({
      id: m.id,
      title: m.title,
      posterPath: m.poster_path
        ? `https://image.tmdb.org/t/p/w185${m.poster_path}`
        : null,
      year: m.release_date ? new Date(m.release_date).getFullYear() : null,
      overview: m.overview,
      rating: m.vote_average,
    }));

    return NextResponse.json(movies);
  } catch {
    return NextResponse.json([]);
  }
}
