'use client';

import { Button } from '@heroui/react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import styled from '@emotion/styled'

export default function Page() {
	return (
		<div className="p-4">
			<Button color="primary">Primary Button</Button>
			<CustomButton className="text-white rounded-lg ml-1 bg-blue-500">CustomButton</CustomButton>
			<div className="bg-blue-500 text-white p-4 rounded-lg mt-4">
				This div should have a blue background if Tailwind is working
			</div>
			<ConnectButton />
			<div className="space-y-4">
				<h1 className="text-4xl font-sans font-bold">这是 Open Sans 字体 (Bold)</h1>
				<p className="text-lg font-sans">
					这是 Open Sans 字体 (Regular) - The quick brown fox jumps over the lazy dog
				</p>
				<h2 className="text-2xl font-special font-bold">
					这是 Saira 字体 (SemiBold)，Welcome to ecf.network
				</h2>
				<p className="text-lg font-special">
					这是 Saira 字体 (Regular) - The quick brown fox jumps over the lazy dog
				</p>
			</div>
		</div>
	);
}

const CustomButton = styled(Button)({
	width: '400px',
	backgroundColor: 'red'
})