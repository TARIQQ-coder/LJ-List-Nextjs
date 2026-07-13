import type { CSSProperties } from "react";
import { cn } from "../../lib/utils";

interface SkeletonProps {
  className?: string;
  style?: CSSProperties;
}

export const Skeleton = ({ className, style }: SkeletonProps) => (
  <div
    className={cn("bg-surface-overlay rounded animate-pulse", className)}
    style={style}
  />
);

interface TableSkeletonProps {
  rows?: number;
  cols?: number;
}

export const TableSkeleton = ({ rows = 5, cols = 4 }: TableSkeletonProps) => (
  <div className="space-y-3">
    <div className="flex gap-4">
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton key={i} className="h-4 flex-1" />
      ))}
    </div>
    {Array.from({ length: rows }).map((_, row) => (
      <div key={row} className="flex gap-4">
        {Array.from({ length: cols }).map((_, col) => (
          <Skeleton key={col} className="h-12 flex-1" />
        ))}
      </div>
    ))}
  </div>
);

export const CardSkeleton = () => (
  <div className="bg-surface-raised border border-surface-border rounded-xl p-6 space-y-3">
    <Skeleton className="h-4 w-24" />
    <Skeleton className="h-8 w-16" />
    <Skeleton className="h-3 w-32" />
  </div>
);

interface FormSkeletonProps {
  fields?: number;
}

export const FormSkeleton = ({ fields = 4 }: FormSkeletonProps) => (
  <div className="space-y-6">
    {Array.from({ length: fields }).map((_, i) => (
      <div key={i} className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-full" />
      </div>
    ))}
  </div>
);
