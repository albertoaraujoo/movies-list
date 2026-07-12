import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Navigation } from "@/components/navigation";
import { UsernameModal } from "@/components/onboarding/username-modal";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      <UsernameModal />
      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8">{children}</main>
    </div>
  );
}
