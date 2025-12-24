'use client';

import dynamic from 'next/dynamic';

const MdEditor = dynamic(() => import('@/components/base/MdEditor/index'), {
  ssr: false,
});

export default function Page() {
  return <MdEditor />;
}
