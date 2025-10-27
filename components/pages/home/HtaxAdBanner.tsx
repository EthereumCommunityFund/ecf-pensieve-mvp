'use client';

import { cn } from '@heroui/react';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  type ActiveSlotData,
  useHarbergerSlots,
} from '@/hooks/useHarbergerSlots';

const AUTO_PLAY_INTERVAL = 8000;
const IPFS_PREFIX = 'ipfs://';
const IPFS_GATEWAY = 'https://ipfs.io/ipfs/';
const DATA_URI_PREFIX = 'data:application/json';

interface AdSlide {
  id: string;
  imageUrl: string;
  targetUrl: string;
  altText: string;
}

interface CreativeMetadata {
  mediaUrl?: string;
  linkUrl?: string;
  title?: string;
}

const normalizeCreativeUrl = (value?: string | null): string | null => {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  if (trimmed.startsWith(IPFS_PREFIX)) {
    const ipfsPath = trimmed.slice(IPFS_PREFIX.length);
    return `${IPFS_GATEWAY}${ipfsPath}`;
  }

  try {
    const url = new URL(trimmed);
    if (url.protocol === 'https:' || url.protocol === 'http:') {
      return url.toString();
    }
  } catch (error) {
    return null;
  }

  return null;
};

const parseCreativeMetadata = (uri: string): CreativeMetadata | null => {
  try {
    const [, payload = ''] = uri.split(',');
    if (!payload) {
      return null;
    }
    const decoded = decodeURIComponent(payload);
    return JSON.parse(decoded) as CreativeMetadata;
  } catch (error) {
    return null;
  }
};

const extractCreativeAssets = (
  uri?: string | null,
): {
  imageUrl: string | null;
  targetUrl: string | null;
} => {
  if (!uri) {
    return { imageUrl: null, targetUrl: null };
  }

  if (uri.startsWith(DATA_URI_PREFIX)) {
    const metadata = parseCreativeMetadata(uri);
    const media = normalizeCreativeUrl(metadata?.mediaUrl);
    const link = normalizeCreativeUrl(metadata?.linkUrl);
    return {
      imageUrl: media ?? link ?? null,
      targetUrl: link ?? media ?? null,
    };
  }

  const normalized = normalizeCreativeUrl(uri);
  return {
    imageUrl: normalized,
    targetUrl: normalized,
  };
};

const mapSlotToSlide = (slot: ActiveSlotData): AdSlide | null => {
  const { imageUrl, targetUrl } = extractCreativeAssets(slot.currentAdURI);
  if (!imageUrl) {
    return null;
  }

  return {
    id: slot.id,
    imageUrl,
    targetUrl: targetUrl ?? imageUrl,
    altText: `${slot.slotName} creative`,
  };
};

function mapActiveSlotsToSlides(slots: ActiveSlotData[]): AdSlide[] {
  return slots
    .map((slot) => mapSlotToSlide(slot))
    .filter((slide): slide is AdSlide => Boolean(slide));
}

const HtaxAdBanner = () => {
  const { activeSlots, isLoading, isRefetching, error, refetch } =
    useHarbergerSlots();

  const slides = useMemo(
    () => mapActiveSlotsToSlides(activeSlots),
    [activeSlots],
  );
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (slides.length === 0) {
      setCurrentIndex(0);
      return;
    }

    setCurrentIndex((prev) => (prev >= slides.length ? 0 : prev));
  }, [slides.length]);

  useEffect(() => {
    if (slides.length <= 1) {
      return;
    }

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, AUTO_PLAY_INTERVAL);

    return () => clearInterval(timer);
  }, [slides.length]);

  const handleSelect = useCallback(
    (nextIndex: number) => {
      if (slides.length === 0) {
        return;
      }
      setCurrentIndex(nextIndex);
    },
    [slides.length],
  );

  const handlePrev = useCallback(() => {
    if (slides.length <= 1) {
      return;
    }
    setCurrentIndex((prev) =>
      prev === 0
        ? slides.length - 1
        : (prev - 1 + slides.length) % slides.length,
    );
  }, [slides.length]);

  const handleNext = useCallback(() => {
    if (slides.length <= 1) {
      return;
    }
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const hasSlides = slides.length > 0;

  return (
    <section className="mobile:mt-[12px] mt-[16px]">
      <div className="mt-[12px]">
        {isLoading ? (
          <div className="mobile:h-[190px] h-[230px] animate-pulse rounded-[16px] border border-black/5 bg-black/5" />
        ) : hasSlides ? (
          <div className="relative overflow-hidden rounded-[16px] border border-black/10 bg-black/5">
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {slides.map((slide) => (
                <article key={slide.id} className="min-w-full">
                  <Link
                    href={slide.targetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    prefetch={false}
                    className="mobile:h-[200px] relative block h-[240px] w-full overflow-hidden rounded-[16px]"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={slide.imageUrl}
                      alt={slide.altText}
                      className="size-full object-cover transition duration-300 hover:scale-105"
                      loading="lazy"
                      onError={(event) => {
                        event.currentTarget.style.opacity = '0';
                      }}
                    />
                  </Link>
                </article>
              ))}
            </div>

            {slides.length > 1 && (
              <>
                <button
                  type="button"
                  aria-label="Previous ad"
                  className="absolute left-[12px] top-1/2 flex size-[32px] -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white transition hover:bg-black/60"
                  onClick={handlePrev}
                >
                  ‹
                </button>
                <button
                  type="button"
                  aria-label="Next ad"
                  className="absolute right-[12px] top-1/2 flex size-[32px] -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white transition hover:bg-black/60"
                  onClick={handleNext}
                >
                  ›
                </button>
              </>
            )}

            {isRefetching && (
              <div className="absolute right-[12px] top-[12px] rounded-full border border-black/20 bg-white/80 px-[10px] py-[4px] text-[11px] font-semibold uppercase tracking-[0.08em] text-black/70">
                Refreshing…
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-[12px] rounded-[16px] border border-dashed border-black/10 bg-white p-[20px] text-center">
            <p className="text-[14px] font-semibold text-black/80">
              No active creatives yet
            </p>
            <p className="text-[13px] text-black/60">
              Claim the first Harberger slot and your creative will be
              highlighted here.
            </p>
            <Link
              href="/ad-management"
              className="rounded-full border border-black/15 px-[16px] py-[8px] text-[13px] font-semibold text-black/80 transition hover:bg-black/5"
            >
              Launch ad marketplace
            </Link>
          </div>
        )}
      </div>

      {hasSlides && (
        <div className="mobile:flex-col mobile:items-start mt-[12px] flex items-center gap-[10px]">
          <div className="flex items-center gap-[6px]">
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                aria-label={`Go to slide ${index + 1}`}
                className={cn(
                  'h-[8px] w-[26px] rounded-full border border-black/20 transition',
                  index === currentIndex
                    ? 'bg-black'
                    : 'bg-transparent hover:bg-black/10',
                )}
                onClick={() => handleSelect(index)}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default HtaxAdBanner;
