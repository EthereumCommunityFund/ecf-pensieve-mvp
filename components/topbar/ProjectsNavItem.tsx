'use client';

import { Image, Popover, PopoverContent, PopoverTrigger } from '@heroui/react';
import NextImage from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';

import ECFTypography from '@/components/base/typography';
import { CaretDownIcon } from '@/components/icons';

import Categories from '../pages/home/Categories';

interface ProjectsNavItemProps {
  item: {
    name: string;
    href: string;
    icon: string | React.ReactNode;
    activeIcon: string | React.ReactNode;
    matchPath: string;
  };
}

export function ProjectsNavItem({ item }: ProjectsNavItemProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const debouncedSetIsOpen = useDebouncedCallback(setIsOpen, 300);

  const handleOpen = () => {
    debouncedSetIsOpen.cancel();
    setIsOpen(true);
  };

  const handleClose = () => {
    debouncedSetIsOpen(false);
  };
  const isActiveRoute = pathname === item.matchPath;

  const linkContent = (
    <>
      {typeof (isActiveRoute ? item.activeIcon : item.icon) === 'string' ? (
        <Image
          src={
            isActiveRoute ? (item.activeIcon as string) : (item.icon as string)
          }
          as={NextImage}
          alt={item.name}
          width={24}
          height={24}
          className={`
            !scale-1 size-6
            shrink-0
            ${
              isActiveRoute
                ? 'brightness-0 invert' // Active state (white icon)
                : 'brightness-0' // Default state (black icon)
            }
          `}
        />
      ) : (
        <div className="size-6 shrink-0">
          {isActiveRoute ? item.activeIcon : item.icon}
        </div>
      )}
      <ECFTypography type={'body2'} className="font-semibold text-inherit">
        {item.name}
      </ECFTypography>
      <CaretDownIcon
        className={`
          size-4 shrink-0 transition-transform duration-200
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
      }}
    >
      <PopoverTrigger>
        <Link
          href={item.href}
          className={`
            !scale-1 flex h-8 shrink-0 items-center gap-2
            whitespace-nowrap rounded-[10px]
            px-2.5
            ${
              isActiveRoute
                ? 'bg-black text-white' // Active state
                : 'text-gray-600 hover:bg-[rgba(0,0,0,0.1)]' // Default & Hover states
            }
          `}
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
        <Categories />
      </PopoverContent>
    </Popover>
  );
}
