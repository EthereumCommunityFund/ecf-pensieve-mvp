import { Suspense } from 'react';

import PreviewPostPage from '@/components/pages/discourse/create/PreviewPostPage';

export default function DiscoursePreviewPage() {
  return (
    <Suspense fallback={null}>
      <PreviewPostPage />
    </Suspense>
  );
}
