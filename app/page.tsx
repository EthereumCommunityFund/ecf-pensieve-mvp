'use client';

import { Button } from '@heroui/react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import styled from '@emotion/styled';

import Banner from '@/components/pages/home/banner';
import CardList from '@/components/pages/home/cardList';
import ProjectList from '@/components/pages/home/projectList';

export default function Page() {
	return (
		<>
			<Banner />

			<CardList />

			<ProjectList />
		</>
	);
}

const CustomButton = styled(Button)({
	width: '400px',
	backgroundColor: 'red',
});
