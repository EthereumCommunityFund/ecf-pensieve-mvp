'use client';

import { Skeleton } from '@heroui/react';
import { useMemo } from 'react';

import { useExternalLink } from '@/context/ExternalLinkContext';
import { useHarbergerSlots } from '@/hooks/useHarbergerSlots';
import { extractCreativeAssets } from '@/utils/creative';

import OpenToAdFallback from './OpenToAdFallback';
import { isHtaxAdPlacementActive } from './utils';

const SIDEBAR_PAGE_KEY = 'home';
const SIDEBAR_POSITION_KEY = 'Sidebar';

const SIDEBAR_PAGE_KEY_NORMALIZED = SIDEBAR_PAGE_KEY.toLowerCase();
const SIDEBAR_POSITION_KEY_NORMALIZED = SIDEBAR_POSITION_KEY.toLowerCase();

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
  const { openExternalLink } = useExternalLink();
  const { activeSlots, isLoading } = useHarbergerSlots();
  const isPlacementActive = isHtaxAdPlacementActive(
    SIDEBAR_PAGE_KEY,
    SIDEBAR_POSITION_KEY,
  );

  const slot = useMemo(() => {
    return activeSlots.find((item) => {
      const matchesPlacement =
        item.page?.toLowerCase() === SIDEBAR_PAGE_KEY_NORMALIZED &&
        item.position?.toLowerCase() === SIDEBAR_POSITION_KEY_NORMALIZED;
      if (!matchesPlacement) {
        return false;
      }

      const hasActiveStatus = item.statusLabel === 'Owned';
      const hasOwner = Boolean(item.ownerAddress);
      const isSettled = !item.isOverdue && !item.isExpired;

      return hasActiveStatus && hasOwner && isSettled;
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
        creativeAssets.fallbackImageUrl) &&
      creativeAssets.targetUrl,
  );
  const shouldShowFallback =
    isPlacementActive && !isLoading && !hasRenderableAd;

  if (!isPlacementActive) {
    return null;
  }

  const renderImageContainer = (aspectRatio: number, className?: string) => {
    const baseClass = `relative w-full bg-[#EBEBEB] overflow-hidden rounded-[10px] ${className ?? ''}`;

    if (!slot) {
      return (
        <div className={baseClass} style={{ aspectRatio: `${aspectRatio}` }} />
      );
    }

    const assetUrl = className?.includes('mobile:hidden')
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
            alt={`${slot.slotDisplayName} creative`}
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
          alt={`${slot.slotDisplayName} creative`}
          className="size-full object-cover transition duration-300 hover:scale-105"
          loading="lazy"
        />
      </button>
    );
  };

  const renderFallbackContainer = (aspectRatio: number) => {
    const baseClass =
      'overflow-hidden rounded-[10px] border border-black/10 bg-[#EBEBEB] text-[12px] font-semibold text-black/70';
    return <OpenToAdFallback aspectRatio={aspectRatio} className={baseClass} />;
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
            className="mobile:block hidden w-full animate-pulse rounded-[10px] border border-black/10 bg-[#EBEBEB]"
            style={{ aspectRatio: `${mobileAspectRatio}` }}
          />
        </>
      ) : hasRenderableAd ? (
        <>
          <div
            className="mobile:hidden overflow-hidden rounded-[10px]"
            style={{ aspectRatio: `${desktopAspectRatio}` }}
          >
            {renderImageContainer(desktopAspectRatio)}
          </div>
          <div
            className="mobile:block hidden overflow-hidden rounded-[10px]"
            style={{ aspectRatio: `${mobileAspectRatio}` }}
          >
            {renderImageContainer(mobileAspectRatio)}
          </div>
        </>
      ) : shouldShowFallback ? (
        <>
          <div
            className="mobile:hidden overflow-hidden rounded-[10px]"
            style={{ aspectRatio: `${desktopAspectRatio}` }}
          >
            {renderFallbackContainer(desktopAspectRatio)}
          </div>
          <div
            className="mobile:block hidden overflow-hidden rounded-[10px]"
            style={{ aspectRatio: `${mobileAspectRatio}` }}
          >
            {renderFallbackContainer(mobileAspectRatio)}
          </div>
        </>
      ) : null}

      {isLoading || hasRenderableAd || shouldShowFallback ? (
        <div className="flex items-center justify-between px-[10px] text-[10px] text-black/80">
          <span className="font-medium">Advertisement | Harberger Tax Ads</span>
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
  );
}
