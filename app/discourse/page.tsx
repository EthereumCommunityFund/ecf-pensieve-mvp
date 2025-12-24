import { Suspense } from 'react';

import GlobalDiscoursePage from '@/components/pages/discourse/list/GlobalDiscoursePage';

export default function DiscoursePage() {
  return (
    <div className="pt-[20px]">
      <Suspense fallback={null}>
        <GlobalDiscoursePage />
      </Suspense>
    </div>
  );
}
