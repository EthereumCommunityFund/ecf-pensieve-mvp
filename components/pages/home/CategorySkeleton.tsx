interface CategorySkeletonProps {
  count?: number;
  className?: string;
}

export default function CategorySkeleton({
  count = 8,
  className = '',
}: CategorySkeletonProps) {
  return (
    <div className={className}>
      <div className="flex items-center justify-between">
        <div className="h-[18px] w-40 animate-pulse rounded bg-gray-200" />
        <div className="h-[18px] w-28 animate-pulse rounded bg-gray-200" />
      </div>

      <div className="mt-[14px] flex flex-wrap gap-[14px]">
        {[...Array(count)].map((_, i) => (
          <div
            key={i}
            className="h-[28px] w-32 animate-pulse rounded-full bg-gray-200"
          />
        ))}
      </div>
    </div>
  );
}
