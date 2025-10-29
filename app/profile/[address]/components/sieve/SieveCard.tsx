'use client';

import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from '@heroui/react';

import VisibilityBadge from '@/components/common/VisibilityBadge';
import {
  DotsThreeVerticalIcon,
  PencilSimpleIcon,
  ShareIcon,
  TrashIcon,
} from '@/components/icons';
import dayjs from '@/lib/dayjs';
import { RouterOutputs } from '@/types';
import {
  buildFilterSummary,
  getAdvancedFilterQueryKey,
  parseAdvancedFilters,
} from '@/components/pages/project/customFilters/utils';

type SieveRecord = RouterOutputs['sieve']['getUserSieves'][0];

interface SieveCardProps {
  sieve: SieveRecord;
  onEdit: () => void;
  onShare: () => void;
  onDelete: () => void;
}

const ADVANCED_FILTER_KEY = getAdvancedFilterQueryKey();

const extractFilterSummaries = (targetPath: string): string[] => {
  if (!targetPath) {
    return [];
  }

  const [_, search = ''] = targetPath.split('?');
  if (!search) {
    return [];
  }

  const params = new URLSearchParams(search);
  const serialized = params.get(ADVANCED_FILTER_KEY);
  if (!serialized) {
    return [];
  }

  const filters = parseAdvancedFilters(serialized);
  if (!filters.length) {
    return [];
  }

  const labels = filters.flatMap((filter) =>
    buildFilterSummary(filter).items.map((item) => {
      const parts = [item.label];
      if (item.operatorLabel) {
        parts.push(item.operatorLabel.toLowerCase());
      }
      if (item.valueLabel) {
        parts.push(item.valueLabel);
      }
      return parts.join(' ');
    }),
  );

  return Array.from(new Set(labels));
};

const SieveCard = ({ sieve, onEdit, onShare, onDelete }: SieveCardProps) => {
  const createdAt = dayjs(sieve.createdAt).format('MMM D, YYYY');
  const filterSummaries = extractFilterSummaries(sieve.targetPath);

  return (
    <div className="flex w-full flex-col gap-[12px] rounded-[12px] border border-black/[0.08] bg-white p-[16px] shadow-[0_4px_20px_rgba(15,23,42,0.06)]">
      <div className="flex items-start justify-between gap-[12px]">
        <div className="flex flex-col gap-[8px]">
          <div className="flex flex-wrap items-center gap-[8px]">
            <h3 className="text-[16px] font-semibold leading-[20px] text-black">
              {sieve.name}
            </h3>
            <VisibilityBadge visibility={sieve.visibility} />
          </div>
          {sieve.description && (
            <p className="max-w-[600px] text-[14px] leading-[20px] text-black/70">
              {sieve.description}
            </p>
          )}
          <p className="text-[12px] text-black/45">Saved on {createdAt}</p>
        </div>

        <Dropdown
          classNames={{
            base: 'shadow-none',
            content: 'p-0',
          }}
          placement="bottom-end"
        >
          <DropdownTrigger>
            <button className="flex size-[38px] items-center justify-center rounded-[8px] transition-all hover:bg-[rgba(0,0,0,0.06)]">
              <DotsThreeVerticalIcon size={28} />
            </button>
          </DropdownTrigger>
          <DropdownMenu
            aria-label="Feed actions"
            className="min-w-[171px] rounded-[10px] p-[10px] shadow-lg"
            itemClasses={{
              base: 'rounded-[5px] px-[10px] py-[4px] gap-[10px]',
            }}
          >
            <DropdownItem
              key="edit"
              onPress={onEdit}
              endContent={<PencilSimpleIcon size={18} />}
            >
              Edit Feed
            </DropdownItem>
            <DropdownItem
              key="share"
              onPress={onShare}
              isDisabled={sieve.share.visibility !== 'public'}
              endContent={<ShareIcon size={18} />}
            >
              Share Feed
            </DropdownItem>
            <DropdownItem
              key="delete"
              onPress={onDelete}
              className="text-red-500 data-[hover=true]:bg-red-50 data-[hover=true]:text-red-600"
              endContent={<TrashIcon size={18} />}
            >
              Delete Feed
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>

      {filterSummaries.length > 0 ? (
        <div className="flex flex-wrap gap-[8px]">
          {filterSummaries.map((label) => (
            <span
              key={label}
              className="inline-flex items-center rounded-[8px] bg-[#F5F5F5] px-[10px] py-[4px] text-[12px] text-black/70"
            >
              {label}
            </span>
          ))}
        </div>
      ) : (
        <div className="rounded-[8px] bg-[#F8F8F8] px-[10px] py-[8px] text-[12px] text-black/50">
          No advanced filters captured for this feed.
        </div>
      )}

      <div className="flex flex-wrap items-center gap-[8px] text-[12px] text-black/50">
        <span className="font-semibold text-black/60">Target:</span>
        <code className="rounded-[6px] bg-[#F3F3F3] px-[8px] py-[4px] text-[11px] text-black/70">
          {sieve.share.targetUrl ?? sieve.targetPath}
        </code>
      </div>
    </div>
  );
};

export default SieveCard;
