'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import Image from 'next/image';

import { AuthButton } from '@/components/topbar/auth/AuthButton';

export function AuthSection() {
	const { isConnected } = useAccount();

	if (isConnected) {
		return <ConnectButton />;
	}

	return (
		<div className="flex items-center gap-2 shrink-0 ml-5">
			<AuthButton className="mobile:hidden" variant="signUp">
				Sign Up
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
					width={20}
					height={20}
					className="group-hover:brightness-0 group-hover:invert"
				/>
				<span className="mobile:hidden pc:block">Sign In</span>
			</AuthButton>
			<div className="hidden">
				<ConnectButton />
			</div>
		</div>
	);
}
