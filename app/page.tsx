'use client';

import HomeSidebarAd from '@/components/pages/ad-management/HtaxAd/HomeSidebarAd';
import Banner from '@/components/pages/home/Banner';
import BugBountyEntry from '@/components/pages/home/BugBountyEntry';
import Categories from '@/components/pages/home/Categories';
import HomeList from '@/components/pages/home/HomeList';
import ProjectIntroCard from '@/components/pages/home/ProjectIntroCard';

export default function Page() {
  return (
    <div className="mobile:px-[10px] px-[20px] pb-[56px] pt-[20px]">
      <Banner />

      {/* <HomeTopBannerAd /> */}

      <div className="mobile:block mt-[10px] hidden space-y-[10px]">
        <ProjectIntroCard />
        <HomeSidebarAd />
      </div>

      <Categories
        className="mt-[20px]"
        viewAllSort="top-transparent"
        categorySort="top-transparent"
      />

      <HomeList />

      <BugBountyEntry />
    </div>
  );
}
