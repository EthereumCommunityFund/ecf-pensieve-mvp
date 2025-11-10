'use client';

import { Skeleton } from '@heroui/react';
import { useMemo } from 'react';

import { useExternalLink } from '@/context/ExternalLinkContext';
import { useHarbergerSlots } from '@/hooks/useHarbergerSlots';
import { extractCreativeAssets } from '@/utils/creative';

import OpenToAdFallback from './OpenToAdFallback';
import { isHtaxAdPlacementActive } from './utils';

const PAGE_KEY = 'projectDetail';
const POSITION_KEY = 'TopBanner';

const PAGE_KEY_NORMALIZED = PAGE_KEY.toLowerCase();
const POSITION_KEY_NORMALIZED = POSITION_KEY.toLowerCase();

const DEFAULT_DESKTOP_SIZE = { width: 900, height: 225 };
const DEFAULT_MOBILE_SIZE = { width: 373, height: 93 };

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

export default function ProjectTopBannerAd() {
  const { openExternalLink } = useExternalLink();
  const { activeSlots, isLoading } = useHarbergerSlots();
  const isPlacementActive = isHtaxAdPlacementActive(PAGE_KEY, POSITION_KEY);

  const slot = useMemo(() => {
    return activeSlots.find((item) => {
      const matchesPlacement =
        item.page?.toLowerCase() === PAGE_KEY_NORMALIZED &&
        item.position?.toLowerCase() === POSITION_KEY_NORMALIZED;
      if (!matchesPlacement) {
        return false;
      }

      return item.isDisplayEligible;
    });
  }, [activeSlots]);

  const creativeAssets = useMemo(() => {
    if (!slot) {
      return {
        primaryImageUrl: null,
        desktopImageUrl: null,
        mobileImageUrl: null,
        fallbackImageUrl: null,
        targetUrl: null,
      };
    }
    return extractCreativeAssets(slot.currentAdURI ?? undefined);
  }, [slot]);

  const { desktop: desktopSize, mobile: mobileSize } = useMemo(() => {
    return parseImageSize(slot?.imageSize);
  }, [slot?.imageSize]);

  const desktopAspectRatio = desktopSize.width / desktopSize.height;
  const mobileAspectRatio = mobileSize.width / mobileSize.height;

  const hasRenderableAd = Boolean(
    slot &&
      (creativeAssets.desktopImageUrl ??
        creativeAssets.mobileImageUrl ??
        creativeAssets.primaryImageUrl ??
        creativeAssets.fallbackImageUrl),
  );
  const shouldShowFallback =
    isPlacementActive && !isLoading && !hasRenderableAd;

  if (!isPlacementActive) {
    return null;
  }

  const altText = slot ? `${slot.slotDisplayName} creative` : 'Harberger ad';

  const renderImageContainer = (
    aspectRatio: number,
    visibilityClass: string,
  ) => {
    const baseClass = `relative w-full overflow-hidden rounded-[10px] border border-black/10 bg-black/5 ${visibilityClass}`;

    if (!slot) {
      return (
        <div className={baseClass} style={{ aspectRatio: `${aspectRatio}` }} />
      );
    }

    const assetUrl = visibilityClass.includes('mobile:hidden')
      ? (creativeAssets.desktopImageUrl ?? creativeAssets.primaryImageUrl)
      : (creativeAssets.mobileImageUrl ?? creativeAssets.primaryImageUrl);

    if (!assetUrl) {
      return (
        <div className={baseClass} style={{ aspectRatio: `${aspectRatio}` }} />
      );
    }

    if (!creativeAssets.targetUrl) {
      return (
        <div className={baseClass} style={{ aspectRatio: `${aspectRatio}` }}>
          <img
            src={assetUrl}
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
        onClick={() => openExternalLink(creativeAssets.targetUrl!)}
        className={`${baseClass} cursor-pointer p-0`}
        style={{ aspectRatio: `${aspectRatio}` }}
      >
        <img
          src={assetUrl}
          alt={altText}
          className="size-full object-cover transition duration-300 hover:scale-105"
          loading="lazy"
        />
      </button>
    );
  };

  const renderFallbackContainer = (
    aspectRatio: number,
    visibilityClass: string,
  ) => {
    const baseClass = `overflow-hidden rounded-[10px] border border-black/10 bg-black/5 text-[14px] font-semibold text-black/70 ${visibilityClass}`;
    return <OpenToAdFallback aspectRatio={aspectRatio} className={baseClass} />;
  };

  return (
    <section className="mobile:mx-[10px] mx-[20px] mt-[20px]">
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
        ) : hasRenderableAd ? (
          <>
            {renderImageContainer(desktopAspectRatio, 'mobile:hidden')}
            {renderImageContainer(mobileAspectRatio, 'mobile:block hidden')}
          </>
        ) : shouldShowFallback ? (
          <>
            {renderFallbackContainer(desktopAspectRatio, 'mobile:hidden')}
            {renderFallbackContainer(mobileAspectRatio, 'mobile:block hidden')}
          </>
        ) : null}

        {isLoading || hasRenderableAd || shouldShowFallback ? (
          <div className="flex items-center justify-between px-[12px] text-[11px] text-black/70">
            <span className="font-medium">
              Advertisement | Harberger Tax Ads
            </span>
            {creativeAssets.targetUrl ? (
              <button
                type="button"
                onClick={() => openExternalLink(creativeAssets.targetUrl!)}
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
}
