'use client';

import { Skeleton } from '@heroui/react';
import { useMemo } from 'react';

import { useExternalLink } from '@/context/ExternalLinkContext';
import { useHarbergerSlots } from '@/hooks/useHarbergerSlots';
import { extractCreativeAssets } from '@/utils/creative';

import { isHtaxAdPlacementActive } from './utils';

const BANNER_PAGE_KEY = 'home';
const BANNER_POSITION_KEY = 'TopBanner';

const BANNER_PAGE_KEY_NORMALIZED = BANNER_PAGE_KEY.toLowerCase();
const BANNER_POSITION_KEY_NORMALIZED = BANNER_POSITION_KEY.toLowerCase();

const DEFAULT_DESKTOP_SIZE = { width: 900, height: 225 };
const DEFAULT_MOBILE_SIZE = { width: 900, height: 225 };

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

const HomeTopBannerAd = () => {
  const { openExternalLink } = useExternalLink();
  const { activeSlots, isLoading } = useHarbergerSlots();

  const slot = useMemo(() => {
    return activeSlots.find((item) => {
      const matchesPlacement =
        item.page?.toLowerCase() === BANNER_PAGE_KEY_NORMALIZED &&
        item.position?.toLowerCase() === BANNER_POSITION_KEY_NORMALIZED;
      if (!matchesPlacement) {
        return false;
      }

      const hasActiveStatus = item.statusLabel === 'Owned';
      const hasOwner = Boolean(item.ownerAddress);
      const isSettled = !item.isOverdue && !item.isExpired;

      return hasActiveStatus && hasOwner && isSettled;
    });
  }, [activeSlots]);

  const { primaryImageUrl, targetUrl } = useMemo(() => {
    if (!slot) {
      return { primaryImageUrl: null, targetUrl: null };
    }
    return extractCreativeAssets(slot.currentAdURI ?? undefined);
  }, [slot]);

  const { desktop: desktopSize, mobile: mobileSize } = useMemo(() => {
    return parseImageSize(slot?.imageSize);
  }, [slot?.imageSize]);

  const desktopAspectRatio = desktopSize.width / desktopSize.height;
  const mobileAspectRatio = mobileSize.width / mobileSize.height;

  if (!isLoading && !slot) {
    return null;
  }

  const altText = slot ? `${slot.slotDisplayName} creative` : 'Harberger ad';

  const renderImageContainer = (
    aspectRatio: number,
    visibilityClass: string,
  ) => {
    const baseClass = `relative w-full overflow-hidden rounded-[16px] border border-black/10 bg-black/5 ${visibilityClass}`;

    if (!slot || !primaryImageUrl) {
      return (
        <div className={baseClass} style={{ aspectRatio: `${aspectRatio}` }} />
      );
    }

    if (!targetUrl) {
      return (
        <div className={baseClass} style={{ aspectRatio: `${aspectRatio}` }}>
          <img
            src={primaryImageUrl}
            alt={altText}
            className="size-full object-cover"
            loading="lazy"
          />
        </div>
      );
    }

    return (
      <button
        type="button"
        onClick={() => openExternalLink(targetUrl)}
        className={`${baseClass} cursor-pointer p-0`}
        style={{ aspectRatio: `${aspectRatio}` }}
      >
        <img
          src={primaryImageUrl}
          alt={altText}
          className="size-full object-cover transition duration-300 hover:scale-105"
          loading="lazy"
        />
      </button>
    );
  };

  if (!isHtaxAdPlacementActive(BANNER_PAGE_KEY, BANNER_POSITION_KEY)) {
    return null;
  }

  return (
    <section className="mobile:mt-[12px] mt-[16px]">
      <div className="flex flex-col gap-[6px]">
        {isLoading ? (
          <>
            <Skeleton
              className="mobile:hidden w-full animate-pulse rounded-[16px] border border-black/10 bg-black/5"
              style={{ aspectRatio: `${desktopAspectRatio}` }}
            />
            <Skeleton
              className="mobile:block hidden w-full animate-pulse rounded-[16px] border border-black/10 bg-black/5"
              style={{ aspectRatio: `${mobileAspectRatio}` }}
            />
          </>
        ) : slot ? (
          <>
            {renderImageContainer(desktopAspectRatio, 'mobile:hidden')}
            {renderImageContainer(mobileAspectRatio, 'mobile:block hidden')}
          </>
        ) : null}

        {isLoading || slot ? (
          <div className="flex items-center justify-between px-[12px] text-[11px] text-black/70">
            <span className="font-medium">
              Advertisement | Harberger Tax Ads
            </span>
            {targetUrl ? (
              <button
                type="button"
                onClick={() => openExternalLink(targetUrl)}
                className="font-semibold text-black/80 hover:underline"
              >
                View Details
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
};

export default HomeTopBannerAd;
