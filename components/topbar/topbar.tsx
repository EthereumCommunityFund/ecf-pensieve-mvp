'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button, Kbd, Image, Input } from '@heroui/react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { usePathname } from 'next/navigation';

import { AuthSection } from '@/components/topbar/auth/AuthSection';
import DropDownMenu from '@/components/topbar/dropDownMenu';

import { Navigation } from './navigation';
import { MobileNavigation } from './mobileNavigation';

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
		<header className="fixed top-0 left-0 right-0 bg-white border-b border-[rgba(0,0,0,0.1)] z-50 h-[50px]">
			<div className="w-full px-5 h-full">
				<div className="flex justify-between items-center h-full">
					{/* Logo and Navigation Container */}
					<div className="flex items-center h-full gap-5">
						{/* Logo */}
						<Link
							href="/public"
							className="mobile:hidden flex items-center h-full min-w-[172px]"
						>
							<Image src="/images/Logo.png" alt="ECF" className="h-[24px] w-auto" />
						</Link>

						{/* menu icon */}
						<div className="hidden mobile:block cursor-pointer">
							<Image
								src="/images/common/List.png"
								alt="Menu"
								width={24}
								height={24}
							/>
						</div>

						{/* Search Box */}
						<div className="mobile:hidden w-[300px] h-[32px] flex items-center gap-2 bg-[rgba(0,0,0,0.05)] rounded-lg px-[10px]">
							<Image
								src="/images/common/search.png"
								alt="Search"
								width={20}
								height={20}
							/>
							<input
								type="text"
								placeholder="Quick Search"
								className="flex-1 w-auto h-[20px] bg-transparent border-0 focus:ring-0 focus:outline-none text-sm"
							/>
							<div className="flex items-center h-full">
								<Kbd keys={['command']} className="bg-[rgba(0,0,0,0.1)]">
									K
								</Kbd>
							</div>
						</div>

						{/* Desktop Navigation */}
						<Navigation />
					</div>

					{/* Replace ConnectButton with AuthSection */}
					<div className="flex items-center h-full mobile:hidden">
						<AuthSection />
					</div>
				</div>
			</div>
		</header>
	);
}
