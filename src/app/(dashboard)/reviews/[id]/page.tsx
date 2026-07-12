import { auth } from "@/auth";
import { getReviewThreadAction } from "@/actions/review-actions";
import { ReviewThreadContent } from "@/components/reviews/review-thread-content";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ReviewThreadPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();
  if (!session?.accessToken) return null;

  const thread = await getReviewThreadAction(id).catch(() => null);
  if (!thread) notFound();

  return (
    <div className="max-w-3xl mx-auto">
      <ReviewThreadContent initialThread={thread} />
    </div>
  );
}
