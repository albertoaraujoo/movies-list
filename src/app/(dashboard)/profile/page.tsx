import { auth } from "@/auth";
import { getUserProfileAction, getFollowersAction, getFollowingAction } from "@/actions/user-actions";
import { ProfileHeader } from "@/components/profile/profile-header";
import { EditProfileForm } from "@/components/profile/edit-profile-form";
import { FollowTabs } from "@/components/profile/follow-tabs";
import { PrivacySelect } from "@/components/profile/privacy-select";
import { CreateListDialog } from "@/components/lists/create-list-dialog";
import { UserListsSection } from "@/components/profile/user-lists-section";
import Link from "next/link";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.accessToken) return null;

  const profile = await getUserProfileAction().catch(() => null);
  if (!profile) return null;

  const [followersRes, followingRes] = await Promise.all([
    getFollowersAction(profile.id).catch(() => ({ data: [] })),
    getFollowingAction(profile.id).catch(() => ({ data: [] })),
  ]);

  return (
    <div className="space-y-8">
      <ProfileHeader profile={profile} isOwn />

      <EditProfileForm profile={profile} />

      <div className="flex flex-wrap gap-3">
        <CreateListDialog />
        {profile.username && (
          <Link
            href={`/users/${profile.username}?from=${encodeURIComponent("/profile")}`}
            className="inline-flex items-center px-4 py-2 rounded-xl glass border border-border font-sans text-sm hover:border-gold/30 transition-colors"
          >
            Ver perfil público
          </Link>
        )}
      </div>

      <PrivacySelect value={profile.privacy ?? "public"} />

      <UserListsSection />

      <FollowTabs
        followers={followersRes.data}
        following={followingRes.data}
      />
    </div>
  );
}
