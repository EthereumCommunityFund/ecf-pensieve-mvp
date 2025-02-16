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
                        flex items-center gap-2 h-10 rounded-lg px-3
                        ${
							isActiveRoute(item.matchPath)
								? 'bg-black text-white'
								: 'text-gray-600 hover:bg-[rgba(0,0,0,0.1)]'
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
                            w-6 h-6
                            ${
								isActiveRoute(item.matchPath)
									? 'brightness-0 invert'
									: 'brightness-0'
							}
                        `}
					/>
					<span className="font-medium">{item.name}</span>
				</Link>
			))}
		</nav>
	);
}
