'use client';

import useEmblaCarousel from 'embla-carousel-react';
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
  targetUrl?: string | null;
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
      targetUrl: link ?? null,
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
    targetUrl,
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
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: slides.length > 1 });

  useEffect(() => {
    if (!emblaApi) {
      setCurrentIndex(0);
      return;
    }
    emblaApi.reInit();
  }, [emblaApi, slides.length]);

  useEffect(() => {
    if (!emblaApi) {
      return;
    }

    const handleSelect = () => {
      setCurrentIndex(emblaApi.selectedScrollSnap());
    };

    emblaApi.on('select', handleSelect);
    handleSelect();

    return () => {
      emblaApi.off('select', handleSelect);
    };
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi || slides.length <= 1) {
      return;
    }

    const timer = window.setInterval(() => {
      emblaApi.scrollNext();
    }, AUTO_PLAY_INTERVAL);

    return () => window.clearInterval(timer);
  }, [emblaApi, slides.length]);

  const handleSelectDot = useCallback(
    (index: number) => {
      emblaApi?.scrollTo(index);
    },
    [emblaApi],
  );

  const handlePrev = useCallback(() => {
    emblaApi?.scrollPrev();
  }, [emblaApi]);

  const handleNext = useCallback(() => {
    emblaApi?.scrollNext();
  }, [emblaApi]);

  const hasSlides = slides.length > 0;

  return (
    <section className="mobile:mt-[12px] mt-[16px]">
      <div>
        {isLoading ? (
          <div className="mobile:h-[190px] h-[230px] animate-pulse rounded-[16px] border border-black/5 bg-black/5" />
        ) : hasSlides ? (
          <div className="relative">
            <div
              className="overflow-hidden rounded-[16px] border border-black/10 bg-black/5"
              ref={emblaRef}
            >
              <div
                className="flex touch-pan-y select-none"
                data-embla-container
              >
                {slides.map((slide) => (
                  <article key={slide.id} className="min-w-0 flex-[0_0_100%]">
                    {slide.targetUrl ? (
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
                    ) : (
                      <div className="mobile:h-[200px] relative block h-[240px] w-full overflow-hidden rounded-[16px]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={slide.imageUrl}
                          alt={slide.altText}
                          className="size-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    )}
                  </article>
                ))}
              </div>
            </div>

            {slides.length > 1 && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-[12px]">
                <button
                  type="button"
                  aria-label="Previous ad"
                  className="pointer-events-auto inline-flex size-[34px] items-center justify-center rounded-full bg-black/35 text-white backdrop-blur transition hover:bg-black/60"
                  onClick={handlePrev}
                >
                  ‹
                </button>
                <button
                  type="button"
                  aria-label="Next ad"
                  className="pointer-events-auto inline-flex size-[34px] items-center justify-center rounded-full bg-black/35 text-white backdrop-blur transition hover:bg-black/60"
                  onClick={handleNext}
                >
                  ›
                </button>
              </div>
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
    </section>
  );
};

export default HtaxAdBanner;
