'use client';

import { cn } from '@heroui/react';
import { Cube, FileText, House, PencilCircle } from '@phosphor-icons/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  GitPullDarkIcon,
  GitPullLightIcon,
  MegaphoneIcon,
} from '@/components/icons';
import DropDownMenu from '@/components/topbar/dropDownMenu';
import { ProjectsNavItem } from '@/components/topbar/ProjectsNavItem';
import { isProduction } from '@/constants/env';

import ECFTypography from '../base/typography';

export type NavigationItem = {
  name: string;
  href: string;
  icon: React.ReactNode;
  activeIcon: React.ReactNode;
  matchPath?: string;
  isExternal?: boolean;
  isDesktopOnly?: boolean;
};

// TODO replace png -> svg icon
export const navigationItems: NavigationItem[] = [
  {
    name: 'Home',
    href: '/',
    icon: (
      <House className="pc:size-[18px] tablet:size-[16px] size-[24px] shrink-0" />
    ),
    activeIcon: (
      <House className="pc:size-[18px] tablet:size-[16px]  size-[24px] shrink-0" />
    ),
    matchPath: '/',
  },
  {
    name: 'Projects',
    href: '/projects?sort=top-transparent',
    icon: (
      <Cube className="pc:size-[18px] tablet:size-[16px] size-[24px] shrink-0" />
    ),
    activeIcon: (
      <Cube className="pc:size-[18px] tablet:size-[16px] size-[24px] shrink-0" />
    ),
    matchPath: '/projects',
  },
  {
    name: 'Pending Projects',
    href: '/projects/pending',
    icon: (
      <GitPullDarkIcon className="pc:size-[18px] tablet:size-[16px]  size-[24px] shrink-0" />
    ),
    activeIcon: (
      <GitPullLightIcon className="pc:size-[18px] tablet:size-[16px]  size-[24px] shrink-0" />
    ),
    matchPath: '/projects/pending',
  },
  {
    name: 'Discourse',
    href: isProduction ? '/project/15/complaints' : '/discourse',
    icon: (
      <PencilCircle className="pc:size-[18px] tablet:size-[16px] size-[24px] shrink-0" />
    ),
    activeIcon: (
      <PencilCircle className="pc:size-[18px] tablet:size-[16px] size-[24px] shrink-0" />
    ),
    matchPath: '/discourse',
  },
  {
    name: 'Whitepaper',
    href: 'https://ethereum-community-fund.gitbook.io/the-ecf-pensieve-decentralised-social-consensus',
    icon: (
      <FileText className="pc:size-[18px] tablet:size-[16px]  size-[24px] shrink-0" />
    ),
    activeIcon: (
      <FileText className="pc:size-[18px] tablet:size-[16px]  size-[24px] shrink-0" />
    ),
    isExternal: true,
    isDesktopOnly: false,
  },
  {
    name: 'Pensieve Ads',
    href: '/ad-management',
    icon: (
      <MegaphoneIcon
        size={24}
        className="pc:size-[18px] tablet:size-4 size-6 shrink-0 text-black"
      />
    ),
    activeIcon: (
      <MegaphoneIcon
        size={24}
        className="pc:size-[18px] tablet:size-4 size-6 shrink-0 text-white"
      />
    ),
    matchPath: '/ad-management',
  },
] as const;

export function Navigation() {
  const pathname = usePathname();

  const isActiveRoute = (path?: string) => {
    return pathname === path;
  };

  return (
    <nav
      className={cn(
        'mobile:hidden mr-5 flex min-w-0 items-center gap-2.5',
        'pc:mr-2 pc:gap-1',
        'tablet:mr-2 tablet:gap-2',
      )}
    >
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
        const renderedIcon = isActive ? item.activeIcon : item.icon;

        return (
          <Link
            key={item.name}
            href={item.href}
            target={item.isExternal ? '_blank' : undefined}
            rel={item.isExternal ? 'noopener noreferrer' : undefined}
            className={cn(
              'flex h-8 min-w-0 shrink-0 items-center gap-2 whitespace-nowrap',
              'rounded-[10px] px-2.5 text-sm transition-all duration-200',
              'pc:h-[30px] pc:gap-1.5 pc:px-2 pc:text-[13px]',
              'tablet:h-[28px] tablet:gap-1.5 tablet:px-1.5 tablet:text-xs',
              item.isDesktopOnly && 'tablet:hidden mobile:hidden',
              isActive
                ? 'bg-black text-white'
                : 'text-gray-600 hover:bg-[rgba(0,0,0,0.1)]',
            )}
          >
            <div
              className={cn(
                'flex h-6 w-6 shrink-0 items-center justify-center',
                'pc:h-[18px] pc:w-[18px]',
                'tablet:h-4 tablet:w-4',
              )}
            >
              {renderedIcon}
            </div>
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
    </nav>
  );
}
