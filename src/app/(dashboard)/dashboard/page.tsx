import { Suspense } from "react";
import { Metadata } from "next";
import { CreateListDialog } from "@/components/lists/create-list-dialog";
import { AddMovieDialog } from "@/components/add-movie-dialog";
import { DrawButton } from "@/components/draw-button";
import { ProfilePanel } from "@/components/dashboard/profile-panel";
import { AdminDeduplicateButton } from "@/components/dashboard/admin-deduplicate-button";
import { UserListsSection } from "@/components/profile/user-lists-section";
import { MovieListSection } from "./movie-list-section";
import { MovieGridSkeleton } from "./movie-grid-skeleton";
import { ProfileSkeleton } from "./profile-skeleton";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <Suspense fallback={<ProfileSkeleton />}>
        <ProfilePanel />
      </Suspense>

      {/* Ações visíveis imediatamente */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-end gap-3 flex-wrap">
        <DrawButton />
        <AddMovieDialog />
        <CreateListDialog />
        <AdminDeduplicateButton />
      </div>

      <Suspense fallback={null}>
        <UserListsSection hideDefault title="Suas outras listas" />
      </Suspense>

      {/* Título, contador e grid em streaming */}
      <Suspense fallback={<MovieGridSkeleton />}>
        <MovieListSection />
      </Suspense>
    </div>
  );
}
