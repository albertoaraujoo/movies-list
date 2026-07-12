"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import {
  followUser,
  getNotifications,
  getUnreadNotificationsCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@/lib/api";

async function getToken(): Promise<string> {
  const session = await auth();
  if (!session?.accessToken) throw new Error("Não autenticado");
  return session.accessToken;
}

export async function getNotificationsAction(page = 1) {
  const token = await getToken();
  return getNotifications(token, page);
}

export async function getUnreadNotificationsCountAction() {
  const token = await getToken();
  return getUnreadNotificationsCount(token);
}

export async function markNotificationAsReadAction(id: string) {
  const token = await getToken();
  await markNotificationAsRead(id, token);
  revalidatePath("/notifications");
}

export async function markAllNotificationsAsReadAction() {
  const token = await getToken();
  await markAllNotificationsAsRead(token);
  revalidatePath("/notifications");
}

export async function followUserFromNotificationAction(userId: string) {
  const token = await getToken();
  await followUser(userId, token);
  revalidatePath("/notifications");
  revalidatePath("/profile");
  revalidatePath("/users");
}
