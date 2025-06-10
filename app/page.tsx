'use client';

import Banner from '@/components/pages/home/Banner';
import CardList from '@/components/pages/home/CardList';
import HomeList from '@/components/pages/home/HomeList';

export default function Page() {
  return (
    <div className="px-[20px] pb-[56px] pt-[20px]">
      <Banner />

      <CardList />

      <HomeList />
    </div>
  );
}
