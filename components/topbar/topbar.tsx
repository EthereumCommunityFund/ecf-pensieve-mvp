'use client';

import { Image } from '@heroui/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import UserProfileSection from '../auth/UserProfileSection';
import ECFTypography from '../base/typography';

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
      <div className="size-full px-5 mobile:hidden">
        <div className="flex h-full items-center justify-between">
          <div className="flex h-full items-center gap-5">
            <Link href="/" className="flex h-full min-w-[171px] items-center">
              <Image
                src="/images/Logo.png"
                alt="ECF"
                className="h-auto w-[171px]"
              />
            </Link>

            <div className="flex h-[32px] w-[300px] cursor-pointer items-center gap-2 rounded-lg bg-[rgba(0,0,0,0.05)] p-2.5 tablet:hidden">
              <Image
                src="/images/common/search.png"
                alt="Search"
                width={20}
                height={20}
              />
              {/* <input
								type="text"
								placeholder="Quick Search"
								className="flex-1 w-auto h-[20px] bg-transparent border-0 focus:ring-0 focus:outline-none text-sm placeholder:text-[rgba(0,0,0,0.3)]"
							/> */}
              {/* TODO: global search modal */}
              <ECFTypography
                type="body2"
                className="flex-1 font-semibold opacity-30"
              >
                Quick Search
              </ECFTypography>

              <div className="flex h-[22px] items-center rounded-[7px] bg-[rgba(0,0,0,0.1)] px-1">
                <span className="text-[12px] font-semibold leading-[20px] text-black opacity-40">
                  ⌘K
                </span>
              </div>
            </div>

            <Navigation />
          </div>

          <UserProfileSection />

          {/* <AuthSection /> */}
        </div>
      </div>

      {/* mobile */}
      <div className="flex size-full items-center justify-between px-5 lg:hidden pc:hidden tablet:hidden">
        <MobileMenu />

        <Link
          href="/public"
          className="flex h-full min-w-[172px] flex-1 items-center justify-center"
        >
          <Image src="/images/Logo.png" alt="ECF" className="h-[24px] w-auto" />
        </Link>

        {/*<AuthSection />*/}
        <UserProfileSection />
      </div>
    </header>
  );
}
