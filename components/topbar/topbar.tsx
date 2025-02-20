'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Kbd, Image } from '@heroui/react';
import { usePathname } from 'next/navigation';

import { AuthSection } from '@/components/topbar/auth/AuthSection';

import ECFTypography from '../base/typography';

import { Navigation } from './navigation';
import MobileMenu from './mobileMenu';

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
				// 这里可以聚焦到搜索框
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
		<header className="fixed top-0 left-0 right-0 bg-white border-b border-[rgba(0,0,0,0.1)] z-50 h-[50px] min-w-[390px]">
			{/* desktop/tablet */}
			<div className="mobile:hidden w-full px-5 h-full">
				<div className="flex justify-between items-center h-full">
					<div className="flex items-center h-full gap-5">
						<Link href="/" className="flex items-center h-full min-w-[171px]">
							<Image
								src="/images/Logo.png"
								alt="ECF"
								className="w-[171px] h-[auto]"
							/>
						</Link>

						<div className="w-[300px] h-[32px] flex items-center gap-2 bg-[rgba(0,0,0,0.05)] rounded-lg p-2.5 cursor-pointer">
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
							<ECFTypography type="body2" className="flex-1 font-semibold opacity-30">
								Quick Search
							</ECFTypography>

							<div className="flex items-center h-[22px] px-1 bg-[rgba(0,0,0,0.1)] rounded-[7px]">
								<span className="text-[12px] leading-[20px] text-black font-semibold opacity-40">
									⌘K
								</span>
							</div>
						</div>

						<Navigation />
					</div>

					<AuthSection />
				</div>
			</div>

			{/* mobile */}
			<div className="lg:hidden pc:hidden tablet:hidden flex justify-between items-center w-full px-5 h-full">
				<MobileMenu />

				<Link
					href="/public"
					className="flex-1 flex justify-center items-center h-full min-w-[172px]"
				>
					<Image src="/images/Logo.png" alt="ECF" className="h-[24px] w-auto" />
				</Link>

				<AuthSection />
			</div>
		</header>
	);
}
