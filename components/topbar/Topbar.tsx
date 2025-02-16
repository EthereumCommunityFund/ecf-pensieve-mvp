'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button, Kbd, Image, Input } from '@heroui/react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { usePathname } from 'next/navigation';

import { AuthSection } from '@/components/topbar/auth/AuthSection';

import { Navigation } from './Navigation';
import { MobileNavigation } from './MobileNavigation';

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
		<header className="fixed top-0 left-0 right-0 bg-background border-b border-[rgba(0,0,0,0.1)] z-50 h-[50px]">
			<div className="w-full px-5 h-full">
				<div className="flex justify-between items-center h-full">
					{/* Logo and Navigation Container */}
					<div className="flex items-center h-full gap-5">
						{/* Logo */}
						<Link href="/public" className="flex items-center h-full min-w-[172px]">
							<Image src="/images/Logo.png" alt="ECF" className="h-[24px] w-auto" />
						</Link>

						{/* Search Box */}
						<div className="w-[300px] h-[32px] flex items-center gap-2 bg-[rgba(0,0,0,0.05)] rounded-lg px-[10px]">
							<Image src="/images/common/search.png" alt="Search" width={20} height={20} />
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
					<div className="hidden md:flex items-center h-full">
						<AuthSection />
					</div>

					{/* Mobile menu button */}
					<div className="md:hidden h-full flex items-center">
						<Button
							variant="ghost"
							onClick={() => setIsMenuOpen(!isMenuOpen)}
							className="inline-flex items-center justify-center p-2"
						>
							<span className="sr-only">Open main menu</span>
							{/* Menu icon */}
							<svg
								className="h-6 w-6"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d={
										isMenuOpen
											? 'M6 18L18 6M6 6l12 12'
											: 'M4 6h16M4 12h16M4 18h16'
									}
								/>
							</svg>
						</Button>
					</div>
				</div>
			</div>

			{/* Mobile menu */}
			{isMenuOpen && (
				<div className="md:hidden">
					<div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
						{/* Mobile Search Box */}
						<div className="px-3 py-2">
							<div className="flex items-center bg-gray-50 rounded-lg">
								<button className="p-2 hover:text-primary">
									<span className="sr-only">Search</span>
									<Image
										src="/images/common/search.png"
										alt="Search"
										width={20}
										height={20}
									/>
								</button>
								<input
									type="text"
									placeholder="Quick Search"
									className="w-full px-4 py-2 bg-transparent border-0 focus:ring-0 focus:outline-none text-sm"
								/>
							</div>
						</div>
						<MobileNavigation />
						<div className="px-3 py-2">
							<AuthSection />
						</div>
					</div>
				</div>
			)}
		</header>
	);
}
