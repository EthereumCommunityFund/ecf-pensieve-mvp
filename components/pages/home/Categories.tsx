'use client';

import { Button } from '@heroui/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { AllCategories } from '@/constants/category';

interface IProps {
  className?: string;
  categorySort?: string;
  viewAllSort?: string;
}

const buildProjectsUrl = ({
  category,
  sort,
}: {
  category?: string;
  sort?: string;
}) => {
  const params = new URLSearchParams();

  if (category) {
    params.set('cats', category);
  }

  if (sort) {
    params.set('sort', sort);
  }

  const query = params.toString();
  return `/projects${query ? `?${query}` : ''}`;
};

export default function Categories({
  className = '',
  categorySort,
  viewAllSort,
}: IProps) {
  const router = useRouter();
  const viewAllHref = buildProjectsUrl({ sort: viewAllSort });

  return (
    <div className={className}>
      <div className="flex items-center justify-between">
        <h3 className="text-[14px] font-[600] leading-[18px] text-black/80">
          View Project Categories
        </h3>
        <Link
          href={viewAllHref}
          className="text-[13px] font-[600] leading-[18px] text-black/50 hover:text-black/80 hover:underline"
        >
          View All Projects
        </Link>
      </div>

      <div className="mt-[14px] flex flex-wrap gap-[14px]">
        {AllCategories.map((category) => (
          <Button
            key={category.value}
            size="sm"
            className="rounded-full border border-black/10 bg-[#EBEBEB] px-[12px] py-[4px] text-[14px] leading-[18px] text-black/60"
            onPress={() =>
              router.push(
                buildProjectsUrl({
                  category: category.value,
                  sort: categorySort,
                }),
              )
            }
          >
            {/* hide icon for now, 09.08 */}
            {/* {category.icon} */}
            {category.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
