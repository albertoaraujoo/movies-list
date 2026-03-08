import { MovieGridSkeleton } from "./movie-grid-skeleton";
import { ProfileSkeleton } from "./profile-skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-8">
      <ProfileSkeleton />
      <div className="flex justify-end gap-3">
        <div className="h-10 w-24 rounded-lg bg-white/5 animate-pulse" />
        <div className="h-10 w-32 rounded-lg bg-white/5 animate-pulse" />
      </div>
      <MovieGridSkeleton />
    </div>
  );
}
