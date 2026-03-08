import { DrawnListSkeleton } from "./drawn-list-skeleton";

export default function DrawnLoading() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
        <div className="space-y-2">
          <div className="h-9 w-40 rounded bg-white/5 animate-pulse" />
          <div className="h-4 w-72 rounded bg-white/5 animate-pulse" />
        </div>
      </div>
      <div className="glass border border-white/6 rounded-2xl p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">🎲</span>
          <div className="flex-1 space-y-2">
            <div className="h-4 w-48 rounded bg-white/5 animate-pulse" />
            <div className="h-3 w-full max-w-md rounded bg-white/5 animate-pulse" />
          </div>
        </div>
      </div>
      <DrawnListSkeleton />
    </div>
  );
}
