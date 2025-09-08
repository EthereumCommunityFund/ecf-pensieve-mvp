'use client';

import { Button } from '@heroui/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { AllCategories } from '@/constants/category';

interface IProps {
  className?: string;
}

export default function Categories({ className = '' }: IProps) {
  const router = useRouter();

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
        {AllCategories.map((category) => (
          <Button
            key={category.value}
            size="sm"
            className="rounded-full border border-black/10 bg-[#EBEBEB] px-[12px] py-[4px] text-[14px] leading-[18px] text-black/60"
            onPress={() =>
              router.push(
                `/projects?cats=${encodeURIComponent(category.value)}`,
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
