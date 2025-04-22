'use client';

import Banner from '@/components/pages/home/banner';
import CardList from '@/components/pages/home/cardList';
import HomeList from '@/components/pages/home/homeList';

export default function Page() {
  return (
    <div className="px-[20px] pb-[56px] pt-[20px]">
      <Banner />

      <CardList />

      <HomeList />
    </div>
  );
}
