import { Skeleton } from "@/components/ui/skeleton";

function CardSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="w-full rounded-2xl" style={{ aspectRatio: "2/3" }} />
      <Skeleton className="h-3 w-3/4 rounded" />
      <Skeleton className="h-3 w-1/3 rounded" />
    </div>
  );
}

export function MovieGridSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-9 w-48">
        <Skeleton className="h-full w-full rounded" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
