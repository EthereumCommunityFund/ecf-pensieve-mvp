'use client';

import { Image } from '@heroui/react';
import { ReactNode } from 'react';

import VisibilityBadge from '@/components/common/VisibilityBadge';

interface SieveInfo {
  name: string;
  description?: string | null;
  visibility: 'public' | 'private';
  followCount?: number;
}

interface CreatorInfo {
  name?: string | null;
  avatarUrl?: string | null;
  address?: string | null;
}

interface SieveInfoSectionProps {
  sieve: SieveInfo;
  mode: 'management' | 'public';
  creator?: CreatorInfo | null;
  actions?: ReactNode;
  footerActions?: ReactNode;
}

const formatFollowLabel = (followCount?: number) => {
  if (typeof followCount !== 'number') {
    return null;
  }

  return followCount === 1
    ? '1 follower'
    : `${followCount.toLocaleString()} followers`;
};

const SieveInfoSection = ({
  sieve,
  mode,
  creator,
  actions,
  footerActions,
}: SieveInfoSectionProps) => {
  const followLabel = formatFollowLabel(sieve.followCount);

  return (
    <div className="flex w-full flex-col gap-[16px] rounded-[12px] border border-black/10 bg-white p-[20px] shadow-[0_8px_24px_rgba(15,23,42,0.08)]">
      <div className="flex flex-col gap-[12px] md:flex-row md:items-start md:justify-between">
        <div className="flex flex-col gap-[12px]">
          <div className="flex flex-wrap items-center gap-[10px]">
            <h1 className="text-[22px] font-semibold leading-[26px] text-black">
              {sieve.name}
            </h1>
            <VisibilityBadge visibility={sieve.visibility} />
          </div>
          {sieve.description ? (
            <p className="max-w-[720px] text-[15px] leading-[22px] text-black/70">
              {sieve.description}
            </p>
          ) : null}
          <div className="flex flex-col gap-[8px] text-[13px] text-black/60 md:flex-row md:items-center md:gap-[16px]">
            {followLabel ? (
              <span className="font-medium text-black/70">{followLabel}</span>
            ) : null}
            {mode === 'public' && creator ? (
              <div className="flex items-center gap-[8px]">
                <span className="uppercase tracking-[0.14em] text-black/40">
                  by
                </span>
                <Image
                  src={creator.avatarUrl || '/images/user/avatar_p.png'}
                  alt={creator.name ?? 'Creator avatar'}
                  className="size-[28px] rounded-full object-cover"
                />
                <span className="font-medium text-black/80">
                  {creator.name || 'Unknown'}
                </span>
              </div>
            ) : null}
          </div>
        </div>

        {actions ? (
          <div className="flex flex-wrap items-center gap-[10px]">
            {actions}
          </div>
        ) : null}
      </div>

      {footerActions ? (
        <div className="flex flex-wrap items-center gap-[10px]">
          {footerActions}
        </div>
      ) : null}
    </div>
  );
};

export default SieveInfoSection;
