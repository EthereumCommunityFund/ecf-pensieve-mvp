'use client';

import { useEffect, useRef } from 'react';

import InfoIcon from '../icons/Info';

export function NotificationBanner() {
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateBannerHeight = () => {
      if (bannerRef.current) {
        const height = bannerRef.current.offsetHeight;
        document.documentElement.style.setProperty(
          '--notification-banner-height',
          `${height}px`,
        );
      }
    };

    updateBannerHeight();
    window.addEventListener('resize', updateBannerHeight);

    return () => {
      window.removeEventListener('resize', updateBannerHeight);
    };
  }, []);

  return (
    <div
      ref={bannerRef}
      className="fixed inset-x-0 top-[50px] z-40 border-b border-[rgba(255,193,7,0.3)] bg-[#fff3cd] px-5 py-3"
    >
      <div className="mx-auto flex max-w-[1440px] items-center justify-center gap-3">
        <div className="shrink-0">
          <InfoIcon size={20} />
        </div>
        <p className="text-sm text-[#856404]">
          We are currently performing system upgrades to enhance our platform.
          Some features may be temporarily unavailable during this maintenance
          period.
        </p>
      </div>
    </div>
  );
}
