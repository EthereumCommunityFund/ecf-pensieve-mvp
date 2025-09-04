'use client';

import Banner from '@/components/pages/home/Banner';
import Categories from '@/components/pages/home/Categories';
import HomeList from '@/components/pages/home/HomeList';

export default function Page() {
  return (
    <div className="mobile:px-[10px] px-[20px] pb-[56px] pt-[20px]">
      <Banner />

      <Categories className="mt-[20px]" />

      <HomeList />
    </div>
  );
}
