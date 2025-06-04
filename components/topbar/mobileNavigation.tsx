'use client';

import { Image } from '@heroui/react';
import NextImage from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { navigationItems, type NavigationItem } from './navigation';

export function MobileNavigation() {
  const pathname = usePathname();

  const isActiveRoute = (path: string) => {
    return pathname === path;
  };

  return (
    <nav className="flex flex-col gap-2">
      {navigationItems.map((item: NavigationItem) => (
        <Link
          key={item.name}
          href={item.href}
          className={`
                        flex h-10 items-center gap-2 rounded-lg px-3
                        ${
                          isActiveRoute(item.matchPath)
                            ? 'bg-black text-white'
                            : 'text-gray-600 hover:bg-[rgba(0,0,0,0.1)]'
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
                size-6
                ${
                  isActiveRoute(item.matchPath)
                    ? 'brightness-0 invert'
                    : 'brightness-0'
                }
              `}
            />
          ) : (
            <div className="size-6">
              {isActiveRoute(item.matchPath) ? item.activeIcon : item.icon}
            </div>
          )}
          <span className="font-medium">{item.name}</span>
        </Link>
      ))}
    </nav>
  );
}
