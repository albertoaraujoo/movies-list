import { auth } from "@/auth";
import { getPublicProfileAction } from "@/actions/user-actions";
import { FollowListPageContent } from "@/components/profile/follow-list-page-content";
import { redirect, notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ username: string }>;
}

export default async function UserFollowingPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.accessToken) redirect("/login");

  const { username } = await params;
  const profile = await getPublicProfileAction(username).catch(() => null);
  if (!profile) notFound();

  return (
    <FollowListPageContent
      userId={profile.id}
      type="following"
      returnHref={`/users/${username}`}
      returnLabel="Voltar ao perfil"
    />
  );
}
