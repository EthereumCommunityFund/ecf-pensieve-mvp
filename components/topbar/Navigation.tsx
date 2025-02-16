'use client';

import { Image } from '@heroui/react';
import NextImage from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export type NavigationItem = {
	name: string;
	href: string;
	icon: string;
	activeIcon: string;
	matchPath: string;
};

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
		<nav className="hidden md:flex items-center gap-2">
			{navigationItems.map((item) => (
				<Link
					key={item.name}
					href={item.href}
					className={`
                        flex items-center gap-2 h-8 rounded-lg px-2.5
                        transition-all duration-200 whitespace-nowrap flex-shrink-0
                        ${
							isActiveRoute(item.matchPath)
								? 'bg-black text-white' // Active state
								: 'text-gray-600 hover:bg-[rgba(0,0,0,0.1)]' // Default & Hover states
						}
                    `}
				>
					<Image
						src={isActiveRoute(item.matchPath) ? item.activeIcon : item.icon}
						as={NextImage}
						alt={item.name}
						width={24}
						height={24}
						className={`
                            w-6 h-6 flex-shrink-0
                            ${
								isActiveRoute(item.matchPath)
									? 'brightness-0 invert' // Active state (white icon)
									: 'brightness-0' // Default state (black icon)
							}
                            transition-all duration-200
                        `}
					/>
					<span className="font-medium">{item.name}</span>
				</Link>
			))}
		</nav>
	);
}
