'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    chatwootSDK?: {
      run: (config: {
        baseUrl: string;
        websiteToken: string;
        position?: 'left' | 'right';
      }) => void;
    };
  }
}

const CHATWOOT_BASE_URL = process.env.NEXT_PUBLIC_CHATWOOT_BASE_URL;
const CHATWOOT_WEBSITE_TOKEN = process.env.NEXT_PUBLIC_CHATWOOT_WEBSITE_TOKEN;
const CHATWOOT_SCRIPT_ID = 'chatwoot-sdk-script';

export function ChatwootWidget({
  position = 'right',
}: {
  position?: 'left' | 'right';
}) {
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const runWidget = () => {
      if (!CHATWOOT_BASE_URL || !CHATWOOT_WEBSITE_TOKEN) {
        console.warn(
          'Chatwoot: missing base URL or website token, widget skipped',
        );
        return;
      }

      window.chatwootSDK?.run({
        baseUrl: CHATWOOT_BASE_URL,
        websiteToken: CHATWOOT_WEBSITE_TOKEN,
        position,
      });
    };

    const existingScript = document.getElementById(
      CHATWOOT_SCRIPT_ID,
    ) as HTMLScriptElement | null;

    if (existingScript) {
      runWidget();
      return;
    }

    const script = document.createElement('script');
    script.id = CHATWOOT_SCRIPT_ID;
    script.src = `${CHATWOOT_BASE_URL}/packs/js/sdk.js`;
    script.async = true;
    script.defer = true;
    script.onload = runWidget;

    document.body.appendChild(script);
  }, [position]);

  return null;
}
