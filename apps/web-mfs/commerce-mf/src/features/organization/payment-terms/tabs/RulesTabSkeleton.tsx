import { CardSkeleton } from '@vritti/quantum-ui/Card';
import { Skeleton } from '@vritti/quantum-ui/Skeleton';

export const RulesTabSkeleton = () => (
  <div className="flex flex-col gap-4">
    <CardSkeleton>
      <div className="flex items-start justify-between gap-4 border-b px-6 pb-6">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="flex items-center gap-4">
          <Skeleton className="size-14 rounded-full" />
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-8 w-24" />
        </div>
      </div>
      <div className="flex flex-col gap-2 px-6 pt-6">
        <Skeleton className="mx-2 mt-6 mb-2 h-32" />
        <div className="mt-2 grid grid-cols-[repeat(auto-fill,minmax(15rem,1fr))] gap-3">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
      </div>
    </CardSkeleton>

    <CardSkeleton>
      <div className="flex flex-wrap items-start justify-between gap-4 border-b px-6 pb-6">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-4 w-80" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-8 w-36" />
        </div>
      </div>
      <div className="flex flex-col gap-2 px-6 pt-6">
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
      </div>
    </CardSkeleton>
  </div>
);
