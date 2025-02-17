'use client';

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
