import { Skeleton } from "@/components/ui/skeleton";

export function DrawnListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 p-3 rounded-2xl border border-white/6 bg-neutral-900/30"
        >
          <Skeleton className="w-10 h-14 rounded-lg shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}
