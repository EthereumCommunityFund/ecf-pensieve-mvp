import Link from 'next/link';

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
        <h3 className="text-[14px] font-[600] leading-[18px] text-black/80">
          View Project Categories
        </h3>
        <Link
          href="/projects"
          className="text-[13px] font-[600] leading-[18px] text-black/50 hover:text-black/80 hover:underline"
        >
          View All Projects
        </Link>
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
