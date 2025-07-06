'use client';

import { Image } from '@heroui/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import { useAuth } from '@/context/AuthContext';

import UserProfileSection from '../auth/UserProfileSection';
import { NotificationDropdown } from '../biz/NotificationDropdown';

import MobileMenu from './mobileMenu';
import { Navigation } from './navigation';

const navigationItems = [
  {
    name: 'Home',
    href: '/',
    icon: '/home/home.svg',
    matchPath: '/',
  },
  {
    name: 'Projects',
    href: '/projects',
    icon: '/home/projects.svg',
    matchPath: '/projects',
  },
  {
    name: 'Contribute',
    href: '/contribute',
    icon: '/home/contribute.svg',
    matchPath: '/contribute',
  },
] as const;

export function Topbar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        setIsSearchOpen(true);
        const searchInput = document.querySelector(
          'input[type="text"]',
        ) as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const isActiveRoute = (path: string) => {
    return pathname.startsWith(path);
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 h-[50px] min-w-[390px] border-b border-[rgba(0,0,0,0.1)] bg-white">
      {/* desktop/tablet */}
      <div className="mobile:hidden size-full px-5">
        <div className="flex h-full items-center justify-between">
          <div className="flex h-full items-center gap-5">
            <Link href="/" className="flex h-full min-w-[171px] items-center">
              <Image
                src="/images/Logo.png"
                alt="ECF"
                className="h-auto w-[171px]"
              />
            </Link>

            <Navigation />
          </div>

          <div className="flex items-center justify-end gap-[10px]">
            {isAuthenticated && <NotificationDropdown />}
            <UserProfileSection />
          </div>

          {/* <AuthSection /> */}
        </div>
      </div>

      {/* mobile */}
      <div className="pc:hidden tablet:hidden flex size-full items-center justify-between px-5 lg:hidden">
        <MobileMenu />

        <Link
          href="/"
          className="flex h-full min-w-[172px] flex-1 items-center justify-center"
        >
          <Image src="/images/Logo.png" alt="ECF" className="h-[24px] w-auto" />
        </Link>

        <div className="flex items-center justify-end gap-[10px]">
          {isAuthenticated && <NotificationDropdown />}
          <UserProfileSection />
        </div>
      </div>
    </header>
  );
}
