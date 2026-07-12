"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import {
  createReview,
  createReviewComment,
  deleteReview,
  deleteReviewComment,
  getPublicReviews,
  getReviewByMovie,
  getReviewThread,
  getWatchedReviews,
  toggleReviewLike,
  updateReview,
} from "@/lib/api";
import type { CreateReviewPayload, UpdateReviewPayload } from "@/lib/types";

async function getToken(): Promise<string> {
  const session = await auth();
  if (!session?.accessToken) throw new Error("Não autenticado");
  return session.accessToken;
}

export async function getWatchedReviewsAction(page = 1) {
  const token = await getToken();
  return getWatchedReviews(token, page);
}

export async function getReviewByMovieAction(movieId: string) {
  const token = await getToken();
  return getReviewByMovie(movieId, token);
}

export async function getReviewThreadAction(reviewId: string) {
  const token = await getToken();
  return getReviewThread(reviewId, token);
}

export async function getPublicReviewsAction(username: string, page = 1) {
  const token = await getToken();
  return getPublicReviews(username, token, page);
}

export async function createReviewAction(payload: CreateReviewPayload) {
  const token = await getToken();
  const review = await createReview(payload, token);
  revalidatePath("/watched");
  revalidatePath(`/movies/${payload.movieId}`);
  revalidatePath("/dashboard");
  revalidatePath("/activity");
  return review;
}

export async function updateReviewAction(id: string, payload: UpdateReviewPayload, movieId: string) {
  const token = await getToken();
  const review = await updateReview(id, payload, token);
  revalidatePath("/watched");
  revalidatePath(`/movies/${movieId}`);
  revalidatePath(`/reviews/${id}`);
  return review;
}

export async function deleteReviewAction(id: string, movieId: string) {
  const token = await getToken();
  await deleteReview(id, token);
  revalidatePath("/watched");
  revalidatePath(`/movies/${movieId}`);
}

export async function toggleReviewLikeAction(reviewId: string) {
  const token = await getToken();
  const result = await toggleReviewLike(reviewId, token);
  revalidatePath(`/reviews/${reviewId}`);
  revalidatePath("/activity");
  return result;
}

export async function createReviewCommentAction(
  reviewId: string,
  payload: { text: string; parentId?: string }
) {
  const token = await getToken();
  const comment = await createReviewComment(reviewId, payload, token);
  revalidatePath(`/reviews/${reviewId}`);
  return comment;
}

export async function deleteReviewCommentAction(reviewId: string, commentId: string) {
  const token = await getToken();
  await deleteReviewComment(commentId, token);
  revalidatePath(`/reviews/${reviewId}`);
}
