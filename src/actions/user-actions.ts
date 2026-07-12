"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import {
  checkUsername,
  followUser,
  getFollowers,
  getFollowing,
  getPublicProfile,
  getUserProfile,
  unfollowUser,
  updatePrivacy,
  updateProfile,
  updateUsername,
} from "@/lib/api";
import type { ProfilePrivacy } from "@/lib/types";

async function getToken(): Promise<string> {
  const session = await auth();
  if (!session?.accessToken) throw new Error("Não autenticado");
  return session.accessToken;
}

export async function getUserProfileAction() {
  const token = await getToken();
  return getUserProfile(token);
}

export async function checkUsernameAction(username: string) {
  return checkUsername(username);
}

export async function updateUsernameAction(username: string) {
  const token = await getToken();
  const profile = await updateUsername(username, token);
  revalidatePath("/");
  revalidatePath("/profile");
  return profile;
}

export async function updateProfileAction(payload: { name?: string; username?: string }) {
  const token = await getToken();
  const profile = await updateProfile(payload, token);
  revalidatePath("/");
  revalidatePath("/profile");
  revalidatePath("/dashboard");
  if (profile.username) {
    revalidatePath(`/users/${profile.username}`);
  }
  return profile;
}

export async function updatePrivacyAction(privacy: ProfilePrivacy) {
  const token = await getToken();
  const profile = await updatePrivacy(privacy, token);
  revalidatePath("/profile");
  return profile;
}

export async function getPublicProfileAction(username: string) {
  const token = await getToken();
  return getPublicProfile(username, token);
}

export async function followUserAction(userId: string) {
  const token = await getToken();
  await followUser(userId, token);
  revalidatePath("/profile");
  revalidatePath("/users");
  revalidatePath("/notifications");
}

export async function unfollowUserAction(userId: string) {
  const token = await getToken();
  await unfollowUser(userId, token);
  revalidatePath("/profile");
  revalidatePath("/users");
  revalidatePath("/notifications");
}

export async function getFollowersAction(userId: string, page = 1) {
  const token = await getToken();
  return getFollowers(userId, token, page);
}

export async function getFollowingAction(userId: string, page = 1) {
  const token = await getToken();
  return getFollowing(userId, token, page);
}
