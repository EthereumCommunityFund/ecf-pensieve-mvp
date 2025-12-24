'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function RedirectClient({ targetUrl }: { targetUrl: string }) {
  const router = useRouter();

  useEffect(() => {
    router.replace(targetUrl);
  }, [router, targetUrl]);

  return null;
}
