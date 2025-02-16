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
				<p className="font-sans font-bold"> Open Sans (Bold)</p>
				<p className="font-sans font-semibold">Open Sans (SemiBold)</p>
				<p className="font-sans font-medium">Open Sans (Medium)</p>
				<p className="font-sans">Open Sans (Regular)</p>
			</div>
		</div>
	);
}

const CustomButton = styled(Button)({
	width: '400px',
	backgroundColor: 'red'
})