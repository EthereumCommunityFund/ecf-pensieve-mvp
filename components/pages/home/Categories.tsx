'use client';

import { Button } from '@heroui/react';
import type { IconProps } from '@phosphor-icons/react';
import { Heart, ShieldCheck, SquaresFour } from '@phosphor-icons/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { AllCategories } from '@/constants/category';

interface IProps {
  className?: string;
  categorySort?: string;
  viewAllSort?: string;
}

type RankSortOption = {
  label: string;
  sort: string;
  Icon: (props: IconProps) => JSX.Element;
};

const RANK_SORT_OPTIONS: RankSortOption[] = [
  {
    label: 'Top Community-trusted',
    sort: 'top-community-trusted',
    Icon: Heart,
  },
  { label: 'Top Transparent', sort: 'top-transparent', Icon: SquaresFour },
  { label: 'Top Accountable', sort: 'top-accountable', Icon: ShieldCheck },
];

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

      <div className="mt-[14px] flex flex-wrap gap-[10px]">
        {AllCategories.map((category) => (
          <Button
            key={category.value}
            size="sm"
            className="h-auto min-h-0 rounded-[20px] bg-[#F5F5F5] px-[10px] py-[5px] text-[13px] font-[600] leading-[18px] text-black/70 transition-colors hover:bg-[#EAEAEA]"
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

      <div className="mt-[24px]">
        <p className="text-[13px] font-[600] leading-[18px] text-black/60">
          Explore by Rank:
        </p>

        <div className="mt-[10px] flex flex-wrap gap-[10px]">
          {RANK_SORT_OPTIONS.map((option) => (
            <Button
              key={option.sort}
              size="sm"
              className="h-auto min-h-0 gap-[5px] rounded-[20px] bg-[#F5F5F5] px-[10px] py-[5px] text-[13px] font-[600] leading-[18px] text-black/70 transition-colors hover:bg-[#EAEAEA]"
              startContent={
                <option.Icon
                  size={16}
                  weight="fill"
                  className="text-black/60"
                />
              }
              onPress={() =>
                router.push(
                  buildProjectsUrl({
                    sort: option.sort,
                  }),
                )
              }
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
