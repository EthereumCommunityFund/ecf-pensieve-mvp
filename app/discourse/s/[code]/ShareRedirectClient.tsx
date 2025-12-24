'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ShareRedirectClient({
  targetUrl,
}: {
  targetUrl: string;
}) {
  const router = useRouter();

  useEffect(() => {
    if (!targetUrl) {
      return;
    }

    try {
      router.replace(targetUrl);
    } catch {
      window.location.replace(targetUrl);
    }
  }, [router, targetUrl]);

  return (
    <>
      <noscript>
        <meta httpEquiv="refresh" content={`0;url=${targetUrl}`} />
        <p>
          JavaScript is disabled. <a href={targetUrl}>Continue</a>
        </p>
      </noscript>
    </>
  );
}
