'use client';

import Banner from '@/components/pages/home/Banner';
import CardList from '@/components/pages/home/CardList';
import HomeList from '@/components/pages/home/HomeList';
import ProjectIntro from '@/components/pages/home/ProjectIntro';

export default function Page() {
  return (
    <div className="px-[20px] pb-[56px] pt-[20px]">
      <Banner />

      <ProjectIntro />

      <CardList />

      <HomeList />
    </div>
  );
}
