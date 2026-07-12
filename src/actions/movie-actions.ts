"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import {
  addMovieToDrawn,
  addMovieToDrawnFromTmdb,
  bulkCreateMovies,
  createMovie,
  deduplicateMovies,
  deleteMovie,
  drawMovie,
  getMovie,
  backfillGenres,
  removeDrawnMovie,
  syncMovieTmdb,
  updateMovie,
} from "@/lib/api";
import type {
  BulkCreateMoviesPayload,
  CreateMoviePayload,
  DrawnMovie,
  Movie,
  UpdateMoviePayload,
} from "@/lib/types";

async function getToken(): Promise<string> {
  const session = await auth();
  if (!session?.accessToken) throw new Error("Não autenticado");
  return session.accessToken;
}

export async function createMovieAction(payload: CreateMoviePayload) {
  const token = await getToken();
  const movie = await createMovie(payload, token);
  revalidatePath("/");
  return movie;
}

export async function updateMovieAction(id: string, payload: UpdateMoviePayload) {
  const token = await getToken();
  const movie = await updateMovie(id, payload, token);
  revalidatePath("/");
  revalidatePath("/drawn");
  return movie;
}

export async function deleteMovieAction(id: string) {
  const token = await getToken();
  await deleteMovie(id, token);
  revalidatePath("/");
  revalidatePath("/drawn");
}

export async function markWatchedAction(id: string, watched: boolean) {
  const token = await getToken();
  const movie = await updateMovie(id, { watched }, token);
  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath("/drawn");
  revalidatePath("/lists");
  revalidatePath(`/movies/${id}`);
  return movie;
}

export async function drawMovieAction() {
  const token = await getToken();
  const drawn = await drawMovie(token);
  revalidatePath("/drawn");
  revalidatePath("/");
  return drawn;
}

export async function removeDrawnMovieAction(drawnId: string) {
  const token = await getToken();
  await removeDrawnMovie(drawnId, token);
  revalidatePath("/drawn");
}

export async function addMovieToDrawnAction(movieId: string): Promise<DrawnMovie> {
  const token = await getToken();
  const drawn = await addMovieToDrawn(movieId, token);
  revalidatePath("/drawn");
  revalidatePath("/");
  return drawn;
}

export async function addMovieToDrawnFromTmdbAction(payload: {
  title: string;
  tmdbId?: number;
  year?: number;
}): Promise<DrawnMovie> {
  const token = await getToken();
  const drawn = await addMovieToDrawnFromTmdb(payload, token);
  revalidatePath("/drawn");
  revalidatePath("/");
  return drawn;
}

export async function getMovieAction(id: string): Promise<Movie | null> {
  try {
    const token = await getToken();
    return await getMovie(id, token);
  } catch {
    return null;
  }
}

export async function syncMovieTmdbAction(id: string) {
  const token = await getToken();
  await syncMovieTmdb(id, token);
  revalidatePath("/");
  revalidatePath("/drawn");
  revalidatePath(`/movies/${id}`);
  // Refetch do filme completo (o sync pode retornar payload mínimo; GET traz tudo)
  return await getMovie(id, token);
}

export async function bulkCreateMoviesAction(payload: BulkCreateMoviesPayload) {
  const token = await getToken();
  const movies = await bulkCreateMovies(payload, token);
  revalidatePath("/");
  revalidatePath("/dashboard");
  return movies;
}

export async function deduplicateMoviesAction() {
  const token = await getToken();
  const result = await deduplicateMovies(token);
  revalidatePath("/");
  revalidatePath("/drawn");
  return result;
}

export async function backfillGenresAction() {
  const token = await getToken();
  let totalUpdated = 0;
  let remaining = 1;
  let guard = 0;

  while (remaining > 0 && guard < 20) {
    const result = await backfillGenres(token);
    totalUpdated += result.updated;
    remaining = result.remaining;
    guard += 1;
    if (result.updated === 0) break;
  }

  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath("/lists");

  return { updated: totalUpdated, remaining };
}
