import { auth } from "@/auth";
import { getPublicProfileAction } from "@/actions/user-actions";
import { PublicProfileContent } from "@/components/profile/public-profile-content";
import { getPublicReviewsAction } from "@/actions/review-actions";
import { getBackHref } from "@/lib/grid-url-state";

interface PageProps {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ from?: string }>;
}

export default async function UserProfilePage({ params, searchParams }: PageProps) {
  const { username } = await params;
  const { from } = await searchParams;
  const session = await auth();

  let profile = null;
  let isPrivate = false;

  try {
    profile = await getPublicProfileAction(username);
  } catch (err) {
    if (err instanceof Error && err.message.includes("privado")) {
      isPrivate = true;
    }
  }

  const isOwn = session?.user?.username === username;
  const returnHref = getBackHref(from, isOwn ? "/profile" : "/dashboard");

  const reviewsResponse =
    profile && !isPrivate
      ? await getPublicReviewsAction(username).catch(() => null)
      : null;

  return (
    <PublicProfileContent
      profile={profile}
      isPrivate={isPrivate}
      isOwn={isOwn}
      reviews={reviewsResponse?.data ?? []}
      returnHref={returnHref}
    />
  );
}
