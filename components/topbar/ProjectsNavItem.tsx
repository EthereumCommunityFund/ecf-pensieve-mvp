'use client';

import { Popover, PopoverContent, PopoverTrigger, cn } from '@heroui/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';

import ECFTypography from '@/components/base/typography';
import { CaretDownIcon } from '@/components/icons';

import Categories from './ProjectsCategories';

interface ProjectsNavItemProps {
  item: {
    name: string;
    href: string;
    icon: React.ReactNode;
    activeIcon: React.ReactNode;
    matchPath: string;
  };
}

export function ProjectsNavItem({ item }: ProjectsNavItemProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const debouncedSetIsOpen = useDebouncedCallback(setIsOpen, 100);

  const handleOpen = () => {
    debouncedSetIsOpen.cancel();
    setIsOpen(true);
  };

  const handleClose = () => {
    debouncedSetIsOpen(false);
  };
  const isActiveRoute = pathname === item.matchPath;

  const renderedIcon = isActiveRoute ? item.activeIcon : item.icon;

  const linkContent = (
    <>
      <div className="pc:size-[18px] tablet:size-4 flex size-6 shrink-0 items-center justify-center">
        {renderedIcon}
      </div>
      <ECFTypography
        type={'body2'}
        className={cn('text-inherit font-semibold')}
      >
        {item.name}
      </ECFTypography>
      <CaretDownIcon
        className={`
          pc:size-[15px] tablet:size-[15px] size-4 shrink-0 transition-transform duration-200
          ${isOpen ? 'rotate-0' : '-rotate-90'}
          ${isActiveRoute ? 'text-white' : 'text-gray-600'}
        `}
        opacity={1}
      />
    </>
  );

  return (
    <Popover
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      placement="bottom"
      showArrow={false}
      offset={10}
      disableAnimation={true}
      classNames={{
        content:
          'p-[14px] !transform-none !transition-none motion-reduce:!transform-none motion-reduce:!transition-none',
        trigger:
          'transition-none data-[open=true]:scale-100 data-[pressed=true]:scale-100',
      }}
    >
      <PopoverTrigger>
        <Link
          href={item.href}
          className={cn(
            'flex h-8 min-w-0 shrink-0 items-center gap-2 whitespace-nowrap',
            'rounded-[10px] px-2.5 text-[14px] transition-all duration-200',
            'pc:h-[30px] pc:gap-1.5 pc:px-2 pc:text-[14px]',
            'tablet:h-[28px] tablet:gap-1.5 tablet:px-1.5 tablet:text-[12px]',
            isActiveRoute
              ? 'bg-black text-white'
              : 'text-gray-600 hover:bg-[rgba(0,0,0,0.1)]',
          )}
          onMouseEnter={handleOpen}
          onMouseLeave={handleClose}
        >
          {linkContent}
        </Link>
      </PopoverTrigger>
      <PopoverContent
        className="w-[600px]"
        onMouseEnter={handleOpen}
        onMouseLeave={handleClose}
      >
        <Categories
          categorySort="top-transparent"
          viewAllSort="top-transparent"
        />
      </PopoverContent>
    </Popover>
  );
}
