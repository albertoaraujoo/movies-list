import { auth } from "@/auth";
import { getNotificationsAction } from "@/actions/notification-actions";
import { NotificationsContent } from "@/components/notifications/notifications-content";

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.accessToken) return null;

  const result = await getNotificationsAction(1).catch(() => ({
    data: [],
    meta: { total: 0, page: 1, limit: 20, totalPages: 0 },
  }));

  return (
    <NotificationsContent
      initialNotifications={result.data}
      initialTotal={result.meta.total}
    />
  );
}
