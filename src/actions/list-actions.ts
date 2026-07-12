"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import {
  createList,
  deleteList,
  deduplicateList,
  getActivity,
  getList,
  getLists,
  addMovieToList,
  removeMovieFromList,
  reorderList,
  toggleFavorite,
  updateList,
} from "@/lib/api";
import type { CreateListPayload, UpdateListPayload } from "@/lib/types";

async function getToken(): Promise<string> {
  const session = await auth();
  if (!session?.accessToken) throw new Error("Não autenticado");
  return session.accessToken;
}

export async function getListsAction() {
  const token = await getToken();
  return getLists(token);
}

export async function getListAction(id: string) {
  const token = await getToken();
  return getList(id, token);
}

export async function createListAction(payload: CreateListPayload) {
  const token = await getToken();
  const list = await createList(payload, token);
  revalidatePath("/dashboard");
  revalidatePath("/profile");
  revalidatePath("/activity");
  return list;
}

export async function updateListAction(id: string, payload: UpdateListPayload) {
  const token = await getToken();
  const list = await updateList(id, payload, token);
  revalidatePath("/dashboard");
  revalidatePath("/profile");
  revalidatePath(`/lists/${id}`);
  return list;
}

export async function deleteListAction(id: string) {
  const token = await getToken();
  await deleteList(id, token);
  revalidatePath("/dashboard");
  revalidatePath("/profile");
  revalidatePath("/lists");
}

export async function toggleFavoriteAction(movieId: string) {
  const token = await getToken();
  const result = await toggleFavorite(movieId, token);
  revalidatePath("/dashboard");
  revalidatePath("/profile");
  revalidatePath(`/movies/${movieId}`);
  revalidatePath("/lists");
  return result;
}

export async function removeMovieFromListAction(listId: string, movieId: string) {
  const token = await getToken();
  await removeMovieFromList(listId, movieId, token);
  revalidatePath("/dashboard");
  revalidatePath("/profile");
  revalidatePath(`/lists/${listId}`);
}

export async function reorderListAction(listId: string, movieIds: string[]) {
  const token = await getToken();
  const list = await reorderList(listId, movieIds, token);
  revalidatePath("/dashboard");
  revalidatePath("/profile");
  revalidatePath(`/lists/${listId}`);
  return list;
}

export async function addMoviesToListsAction(movieIds: string[], listIds: string[]) {
  const token = await getToken();
  for (const movieId of movieIds) {
    for (const listId of listIds) {
      try {
        await addMovieToList(listId, movieId, token);
      } catch (err) {
        const message = err instanceof Error ? err.message : "";
        if (message.includes("já está")) continue;
        throw err;
      }
    }
  }
  for (const listId of listIds) {
    revalidatePath(`/lists/${listId}`);
  }
  revalidatePath("/dashboard");
  revalidatePath("/profile");
}

export async function deduplicateListAction(listId: string) {
  const token = await getToken();
  const result = await deduplicateList(listId, token);
  revalidatePath("/dashboard");
  revalidatePath("/profile");
  revalidatePath(`/lists/${listId}`);
  return result;
}

export async function getActivityAction(scope = "all") {
  const token = await getToken();
  return getActivity(token, scope);
}
