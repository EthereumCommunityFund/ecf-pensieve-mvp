'use client';

import { Image } from '@heroui/react';
import NextImage from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  GitPullDarkIcon,
  GitPullLightIcon,
  MegaphoneIcon,
} from '@/components/icons';
import DropDownMenu from '@/components/topbar/dropDownMenu';
import FeedbackButton from '@/components/topbar/FeedbackButton';
import { ProjectsNavItem } from '@/components/topbar/ProjectsNavItem';

import ECFTypography from '../base/typography';

export type NavigationItem = {
  name: string;
  href: string;
  icon: string | React.ReactNode;
  activeIcon: string | React.ReactNode;
  matchPath?: string;
  isExternal?: boolean;
  isDesktopOnly?: boolean;
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
    href: '/projects?sort=top-transparent',
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
    name: 'Whitepaper',
    href: 'https://ethereum-community-fund.gitbook.io/the-ecf-pensieve-decentralised-social-consensus',
    icon: '/images/docs/FileText.svg',
    activeIcon: '/images/docs/FileText.svg',
    isExternal: true,
    isDesktopOnly: false,
  },
  {
    name: 'Pensieve Ads',
    href: '/ad-management',
    icon: <MegaphoneIcon size={24} className="text-black" />,
    activeIcon: <MegaphoneIcon size={24} className="text-white" />,
    matchPath: '/ad-management',
  },
] as const;

export function Navigation() {
  const pathname = usePathname();

  const isActiveRoute = (path?: string) => {
    return pathname === path;
  };

  return (
    <nav className="mobile:hidden mr-5 flex shrink-0 items-center gap-2.5">
      {navigationItems.map((item) => {
        if (item.name === 'Projects' && item.matchPath === '/projects') {
          return (
            <ProjectsNavItem
              key={item.name}
              item={item as NavigationItem & { matchPath: string }}
            />
          );
        }

        const isActive = isActiveRoute(item.matchPath);

        return (
          <Link
            key={item.name}
            href={item.href}
            target={item.isExternal ? '_blank' : undefined}
            rel={item.isExternal ? 'noopener noreferrer' : undefined}
            className={`
                          flex h-8 shrink-0 items-center gap-2 whitespace-nowrap
                          rounded-[10px] px-2.5 transition-all duration-200
                          ${item.isDesktopOnly ? 'tablet:hidden mobile:hidden' : ''}
                          ${
                            isActive
                              ? 'bg-black text-white'
                              : 'text-gray-600 hover:bg-[rgba(0,0,0,0.1)]'
                          }
                      `}
          >
            {typeof (isActive ? item.activeIcon : item.icon) === 'string' ? (
              <Image
                src={
                  isActive ? (item.activeIcon as string) : (item.icon as string)
                }
                as={NextImage}
                alt={item.name}
                width={24}
                height={24}
                className={`
                                size-6 shrink-0
                                ${isActive ? 'brightness-0 invert' : 'brightness-0'}
                                transition-all duration-200
                            `}
              />
            ) : (
              <div className="size-6 shrink-0">
                {isActive ? item.activeIcon : item.icon}
              </div>
            )}
            <ECFTypography
              type={'body2'}
              className="font-semibold text-inherit"
            >
              {item.name}
            </ECFTypography>
          </Link>
        );
      })}

      <DropDownMenu />
      <FeedbackButton className="tablet:hidden mobile:hidden" />
    </nav>
  );
}
