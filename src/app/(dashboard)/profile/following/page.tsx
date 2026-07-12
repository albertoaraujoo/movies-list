import { auth } from "@/auth";
import { getUserProfileAction } from "@/actions/user-actions";
import { FollowListPageContent } from "@/components/profile/follow-list-page-content";
import { redirect } from "next/navigation";

export default async function ProfileFollowingPage() {
  const session = await auth();
  if (!session?.accessToken) redirect("/login");

  const profile = await getUserProfileAction().catch(() => null);
  if (!profile) redirect("/profile");

  return (
    <FollowListPageContent
      userId={profile.id}
      type="following"
      returnHref="/profile"
      returnLabel="Voltar ao perfil"
    />
  );
}
