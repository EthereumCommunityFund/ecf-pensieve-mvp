'use client';

import Link from 'next/link';
import { useMemo } from 'react';

import { useHarbergerSlots } from '@/hooks/useHarbergerSlots';
import { extractCreativeAssets } from '@/utils/creative';
import { Skeleton } from '@heroui/react';

const SIDEBAR_PAGE_KEY = 'home';
const SIDEBAR_POSITION_KEY = 'Sidebar';

const DEFAULT_DESKTOP_SIZE = { width: 390, height: 214 };
const DEFAULT_MOBILE_SIZE = { width: 390, height: 214 };

function parseImageSize(imageSize?: string) {
  if (!imageSize) {
    return {
      desktop: DEFAULT_DESKTOP_SIZE,
      mobile: DEFAULT_MOBILE_SIZE,
    };
  }

  const [desktopRaw = '', mobileRaw = ''] = imageSize.split('_');

  const parsePair = (pair?: string) => {
    if (!pair) return null;
    const [w, h] = pair.split('*').map((value) => Number(value));
    if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) {
      return null;
    }
    return { width: w, height: h } as const;
  };

  return {
    desktop: parsePair(desktopRaw) ?? DEFAULT_DESKTOP_SIZE,
    mobile:
      parsePair(mobileRaw) ?? parsePair(desktopRaw) ?? DEFAULT_MOBILE_SIZE,
  };
}

export default function HomeSidebarAd() {
  const { activeSlots, isLoading } = useHarbergerSlots();

  const slot = useMemo(() => {
    return activeSlots.find(
      (item) =>
        item.page?.toLowerCase() === SIDEBAR_PAGE_KEY &&
        item.position?.toLowerCase() === SIDEBAR_POSITION_KEY.toLowerCase(),
    );
  }, [activeSlots]);

  const { primaryImageUrl, targetUrl } = useMemo(() => {
    if (!slot) {
      return { primaryImageUrl: null, targetUrl: null };
    }
    const assets = extractCreativeAssets(slot.currentAdURI ?? undefined);
    return assets;
  }, [slot]);

  const { desktop: desktopSize, mobile: mobileSize } = useMemo(() => {
    return parseImageSize(slot?.imageSize);
  }, [slot?.imageSize]);

  const desktopAspectRatio = desktopSize.width / desktopSize.height;
  const mobileAspectRatio = mobileSize.width / mobileSize.height;

  if (!isLoading && !slot) {
    return null;
  }

  const renderImageContainer = (aspectRatio: number, className?: string) => {
    const baseClass = `relative w-full  bg-[#EBEBEB] ${className ?? ''}`;

    if (!slot || !primaryImageUrl || !targetUrl) {
      return (
        <div className={baseClass} style={{ aspectRatio: `${aspectRatio}` }} />
      );
    }

    return (
      <Link
        href={targetUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={baseClass}
        prefetch={false}
        style={{ aspectRatio: `${aspectRatio}` }}
      >
        <img
          src={primaryImageUrl}
          alt={`${slot.slotDisplayName} creative`}
          className="size-full object-cover"
          loading="lazy"
        />
      </Link>
    );
  };

  return (
    <div className="flex flex-col gap-[5px]">
      {isLoading ? (
        <>
          <Skeleton
            className="mobile:hidden w-full animate-pulse rounded-[10px] border border-black/10 bg-[#EBEBEB]"
            style={{ aspectRatio: `${desktopAspectRatio}` }}
          />
          <Skeleton
            className="hidden w-full animate-pulse rounded-[10px] border border-black/10 bg-[#EBEBEB] mobile:block"
            style={{ aspectRatio: `${mobileAspectRatio}` }}
          />
        </>
      ) : slot && targetUrl ? (
        <>
          <div
            className="mobile:hidden overflow-hidden rounded-[10px]"
            style={{ aspectRatio: `${desktopAspectRatio}` }}
          >
            {renderImageContainer(desktopAspectRatio)}
          </div>
          <div
            className="hidden mobile:block overflow-hidden rounded-[10px]"
            style={{ aspectRatio: `${mobileAspectRatio}` }}
          >
            {renderImageContainer(mobileAspectRatio)}
          </div>
        </>
      ) : null}

      {isLoading || slot ? (
        <div className="flex items-center justify-between px-[10px] text-[10px] text-black/80">
          <span className="font-medium">Advertisement | Harberger Tax Ads</span>
          {targetUrl ? (
            <Link
              href={targetUrl}
              target="_blank"
              rel="noopener noreferrer"
              prefetch={false}
              className="font-semibold text-black/80 hover:underline"
            >
              View Details
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
