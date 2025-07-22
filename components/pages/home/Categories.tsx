'use client';

import { Button } from '@heroui/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { trpc } from '@/lib/trpc/client';
import { devLog } from '@/utils/devLog';

import CategorySkeleton from './CategorySkeleton';

interface IProps {
  className?: string;
}

export default function Categories({ className = '' }: IProps) {
  const router = useRouter();
  const { data: categories, isLoading } = trpc.project.getCategories.useQuery(
    undefined,
    {
      select(data) {
        devLog('getCategories', data);
        return data;
      },
    },
  );

  if (isLoading) {
    return <CategorySkeleton className={className} />;
  }

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
        {categories?.map((category) => (
          <Button
            key={category.category}
            size="sm"
            className="h-[28px] rounded-full border border-black/10 bg-[#EBEBEB] text-[14px] leading-[18px] text-black/60"
            onPress={() =>
              router.push(
                `/projects?cat=${encodeURIComponent(category.category)}`,
              )
            }
          >
            {category.category}
          </Button>
        ))}
      </div>
    </div>
  );
}
