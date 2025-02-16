'use client';

import { Button } from '@heroui/react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import styled from '@emotion/styled';

import Bannar from '@/components/pages/home/bannar';
import CardList from '@/components/pages/home/cardList';
import ProjectList from '@/components/pages/home/projectList';

export default function Page() {
	return (
		<>
			<Bannar />

			<CardList />

			<ProjectList />
		</>
	);
}

const CustomButton = styled(Button)({
	width: '400px',
	backgroundColor: 'red',
});
