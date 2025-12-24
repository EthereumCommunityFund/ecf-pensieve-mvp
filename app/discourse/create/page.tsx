import { Suspense } from 'react';

import { CreatePost } from '@/components/pages/discourse/create/CreatePostPage';

export default function DiscourseCreatePage() {
  return (
    <Suspense fallback={null}>
      <CreatePost />
    </Suspense>
  );
}
