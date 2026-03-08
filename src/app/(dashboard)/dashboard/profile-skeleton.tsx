import { Skeleton } from "@/components/ui/skeleton";

export function ProfileSkeleton() {
  return (
    <div className="flex flex-row items-center gap-3 sm:gap-5 p-3 sm:p-5 rounded-2xl bg-neutral-900/50 border border-white/6 backdrop-blur-sm">
      <Skeleton className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl shrink-0" />
      <div className="flex-1 min-w-0 space-y-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-3 w-48" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-12 w-20 rounded-xl" />
        <Skeleton className="h-12 w-20 rounded-xl" />
      </div>
    </div>
  );
}
