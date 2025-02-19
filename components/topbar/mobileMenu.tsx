import {
	Drawer,
	DrawerContent,
	DrawerHeader,
	DrawerBody,
	DrawerFooter,
	Button,
	useDisclosure,
	Image,
	Divider,
} from '@heroui/react';
import Link from 'next/link';
import NextImage from 'next/image';
import { usePathname } from 'next/navigation';

import { navigationItems } from './navigation';
import { DropDownMenuData } from './dropDownMenu';

export default function MobileMenu() {
	const { isOpen, onOpen, onOpenChange } = useDisclosure();

	return (
		<>
			<div
				className="cursor-pointer hover:bg-[rgba(0,0,0,0.1)] px-2.5 py-1 rounded-[5px]"
				onClick={onOpen}
			>
				<Image src="/images/common/List.png" alt="Menu" width={24} height={24} />
			</div>

			<Drawer
				isOpen={isOpen}
				onOpenChange={onOpenChange}
				placement="top"
				hideCloseButton={true}
			>
				<DrawerContent>
					{(onClose) => (
						<>
							<DrawerBody className="pt-[54px]">
								<QuickSearch />

								<MobileNavigation onClose={onClose} />

								<Divider />

								<MoreMenu onClose={onClose} />
							</DrawerBody>
						</>
					)}
				</DrawerContent>
			</Drawer>
		</>
	);
}

const QuickSearch = () => {
	return (
		<div className="w-full h-[32px] flex items-center gap-2 bg-[rgba(0,0,0,0.05)] rounded-lg px-[10px]">
			<Image src="/images/common/search.png" alt="Search" width={20} height={20} />
			<input
				type="text"
				placeholder="Quick Search"
				className="flex-1 w-auto h-[20px] bg-transparent border-0 focus:ring-0 focus:outline-none text-sm"
			/>
		</div>
	);
};

interface NavigationProps {
	onClose: () => void;
}

const MobileNavigation = ({ onClose }: NavigationProps) => {
	const pathname = usePathname();

	const isActiveRoute = (path: string) => {
		return pathname === path;
	};

	return (
		<nav className="mt-2.5 flex flex-col gap-2.5">
			{navigationItems.map((item) => (
				<Link
					key={item.name}
					href={item.href}
					onClick={onClose}
					className={`
                    w-full h-10
                    flex items-center gap-2.5 rounded-[10px] px-[10px] py-2
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
};

const MoreMenu = ({ onClose }: NavigationProps) => {
	return (
		<div className="px-2.5 py-5">
			<div className="flex flex-wrap gap-[20px]">
				{DropDownMenuData.common.map((item) => {
					return (
						<Link
							href={item.link}
							key={item.name}
							onClick={onClose}
							className="font-semibold"
						>
							{item.name}
						</Link>
					);
				})}
			</div>
			<div className="mt-5 flex items-center gap-[20px] bg-white">
				{DropDownMenuData.social.map((item) => (
					<Link
						key={item.name}
						href={item.link}
						onClick={onClose}
						className="p-2 rounded-md hover:bg-[rgba(0,0,0,0.05)] transition-colors"
					>
						<Image
							src={item.icon}
							alt={item.name.toLowerCase()}
							width={24}
							height={24}
						/>
					</Link>
				))}
			</div>
		</div>
	);
};
