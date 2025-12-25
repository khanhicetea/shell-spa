import { Skeleton } from "../ui/skeleton";

export function PagePending() {
  return (
    <div className="space-y-4 py-4">
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="space-y-2">
          {[...Array(10)].map((_, i) => (
            <Skeleton key={`skeleton-${i}`} className="h-16 w-full" />
          ))}
        </div>
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  );
}
