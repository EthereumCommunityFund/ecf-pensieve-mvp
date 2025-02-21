'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useDisconnect } from 'wagmi';
import Image from 'next/image';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@heroui/react';

import { AuthButton } from '@/components/topbar/auth/AuthButton';
import { getShortenAddress } from '@/lib/utils';
import ECFTypography from '@/components/base/typography';

export function AuthSection() {
	const { isConnected, address } = useAccount();
	const { disconnect } = useDisconnect();

	if (isConnected && address) {
		return (
			<div className="flex justify-end items-center gap-2.5">
				<Image
					src="/images/common/Notifications.png"
					alt="Notifications"
					width={32}
					height={32}
				/>
				<Dropdown>
					<DropdownTrigger>
						<div className="flex justify-end items-center h-8 gap-2.5 px-2.5 rounded-[5px] bg-[rgba(0,0,0,0.05)] hover:bg-[rgba(0,0,0,0.1)] cursor-pointer">
							<div className="block bg-[rgba(0,0,0,0.1)] w-[24px] h-[24px] rounded-[24px]"></div>
							<div className="text-[16px] leading-[22px] text-black font-semibold">
								{getShortenAddress(address)}
							</div>
						</div>
					</DropdownTrigger>
					<DropdownMenu disabledKeys={['Connected']}>
						<>
							<DropdownItem
								key="Connected"
								textValue="Connected"
								className="text-[rgba(0,0,0,0.3)] hover:text-[rgba(0,0,0,0.5)]"
							>
								Connected
							</DropdownItem>
							<DropdownItem
								key="Logout"
								textValue="Logout"
								className="text-[rgba(0,0,0,0.3)] hover:text-[rgba(0,0,0,0.5)]"
								onClick={() => disconnect()}
							>
								Logout
							</DropdownItem>
						</>
					</DropdownMenu>
				</Dropdown>
			</div>
		);
	}

	return (
		<div className="flex items-center h-full gap-2.5 shrink-0 ml-5">
			<AuthButton className="tablet:hidden mobile:hidden" variant="signUp">
				<ECFTypography type="body2" className="tablet:hidden mobile:hidden">
					Sign Up
				</ECFTypography>
			</AuthButton>
			<AuthButton
				variant="signIn"
				onClick={() => {
					document
						.querySelector<HTMLElement>('[data-testid="rk-connect-button"]')
						?.click();
				}}
			>
				<Image
					src="/images/common/signIn.png"
					alt="Sign In"
					width={24}
					height={24}
					className="group-hover:brightness-0 group-hover:invert"
				/>
				<ECFTypography type="body1" className="mobile:hidden">
					Sign In
				</ECFTypography>
			</AuthButton>
			<div className="hidden">
				<ConnectButton />
			</div>
		</div>
	);
}
