'use client';

import Banner from '@/components/pages/home/banner';
import CardList from '@/components/pages/home/cardList';
import HomeList from '@/components/pages/home/homeList';
import { trpc } from '@/lib/trpc/client';

export default function Page() {
  const { data: user, isLoading, error } = trpc.user.getCurrentUser.useQuery();
  console.log(user, error?.message, isLoading);

  return (
    <>
      <Banner />

      <CardList />

      <HomeList />
    </>
  );
}
