'use client';

import { Image } from '@heroui/react';
import NextImage from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { GitPullDarkIcon, GitPullLightIcon } from '@/components/icons';
import DropDownMenu from '@/components/topbar/dropDownMenu';

import ECFTypography from '../base/typography';

export type NavigationItem = {
  name: string;
  href: string;
  icon: string | React.ReactNode;
  activeIcon: string | React.ReactNode;
  matchPath: string;
};

// TODO replace png -> svg icon
export const navigationItems: NavigationItem[] = [
  {
    name: 'Home',
    href: '/',
    icon: '/images/home/House-Light.png',
    activeIcon: '/images/home/House-Dark.png',
    matchPath: '/',
  },
  {
    name: 'Projects',
    href: '/projects',
    icon: '/images/home/Cube-Light.png',
    activeIcon: '/images/home/Cube-Dark.png',
    matchPath: '/projects',
  },
  {
    name: 'Pending Projects',
    href: '/projects/pending',
    icon: <GitPullDarkIcon />,
    activeIcon: <GitPullLightIcon />,
    matchPath: '/projects/pending',
  },
  {
    name: 'Contribute',
    href: '/contribute',
    icon: '/images/home/PenNib-Light.png',
    activeIcon: '/images/home/PenNib-Dark.png',
    matchPath: '/contribute',
  },
] as const;

export function Navigation() {
  const pathname = usePathname();

  const isActiveRoute = (path: string) => {
    return pathname === path;
  };

  return (
    <nav className="mobile:hidden mr-5 flex shrink-0 items-center gap-2.5">
      {navigationItems.map((item) => (
        <Link
          key={item.name}
          href={item.href}
          className={`
                        flex h-8 shrink-0 items-center gap-2 whitespace-nowrap
                        rounded-[10px] px-2.5 transition-all duration-200
                        ${
                          isActiveRoute(item.matchPath)
                            ? 'bg-black text-white' // Active state
                            : 'text-gray-600 hover:bg-[rgba(0,0,0,0.1)]' // Default & Hover states
                        }
                    `}
        >
          {typeof (isActiveRoute(item.matchPath)
            ? item.activeIcon
            : item.icon) === 'string' ? (
            <Image
              src={
                isActiveRoute(item.matchPath)
                  ? (item.activeIcon as string)
                  : (item.icon as string)
              }
              as={NextImage}
              alt={item.name}
              width={24}
              height={24}
              className={`
                              size-6 shrink-0
                              ${
                                isActiveRoute(item.matchPath)
                                  ? 'brightness-0 invert' // Active state (white icon)
                                  : 'brightness-0' // Default state (black icon)
                              }
                              transition-all duration-200
                          `}
            />
          ) : (
            <div className="size-6 shrink-0">
              {isActiveRoute(item.matchPath) ? item.activeIcon : item.icon}
            </div>
          )}
          <ECFTypography type={'body2'} className="font-semibold text-inherit">
            {item.name}
          </ECFTypography>
        </Link>
      ))}

      <DropDownMenu />
    </nav>
  );
}
