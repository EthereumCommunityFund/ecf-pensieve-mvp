'use client';

import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from '@heroui/react';
import type { ReactNode } from 'react';

import { Button } from '@/components/base';
import VisibilityBadge from '@/components/common/VisibilityBadge';
import {
  DotsThreeVerticalIcon,
  PencilSimpleIcon,
  TrashIcon,
} from '@/components/icons';
import type { AdvancedFilterConnector } from '@/components/pages/project/customFilters/types';
import {
  buildFilterSummary,
  getAdvancedFilterQueryKey,
  parseAdvancedFilters,
} from '@/components/pages/project/customFilters/utils';
import { SORT_OPTIONS } from '@/components/pages/project/filterAndSort/types';
import { AllCategories } from '@/constants/category';
import dayjs from '@/lib/dayjs';
import { RouterOutputs } from '@/types';

type FilterSummaryDisplayItem = {
  id: string;
  connector?: AdvancedFilterConnector;
  text: string;
};

type SieveRecord = RouterOutputs['sieve']['getUserSieves'][0];

interface SieveCardProps {
  sieve: SieveRecord;
  canManage: boolean;
  onEdit?: () => void;
  onShare?: () => void;
  onDelete?: () => void;
  onView?: (sieve: SieveRecord) => void;
  extraActions?: ReactNode;
}

const ADVANCED_FILTER_KEY = getAdvancedFilterQueryKey();

const SORT_LABEL_MAP = SORT_OPTIONS.reduce<Record<string, string>>(
  (acc, option) => {
    acc[option.value] = option.label;
    return acc;
  },
  {},
);

const CATEGORY_LABEL_MAP = AllCategories.reduce<Record<string, string>>(
  (acc, category) => {
    acc[category.value] = category.label;
    return acc;
  },
  {},
);

const getSearchFromTargetPath = (targetPath: string): string => {
  if (!targetPath) {
    return '';
  }

  const [_, search = ''] = targetPath.split('?');
  return search;
};

const extractFilterSummaries = (
  targetPath: string,
): FilterSummaryDisplayItem[][] => {
  const search = getSearchFromTargetPath(targetPath);
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

  const summaries = filters
    .map((filter) => buildFilterSummary(filter))
    .map((summary) =>
      summary.items
        .map<FilterSummaryDisplayItem | null>((item) => {
          const parts = [item.label];
          if (item.operatorLabel) {
            parts.push(item.operatorLabel.toLowerCase());
          }
          if (item.valueLabel) {
            parts.push(item.valueLabel);
          }

          const text = parts.join(' ').trim();
          if (!text) {
            return null;
          }

          return {
            id: item.id,
            connector: item.connector,
            text,
          };
        })
        .filter(
          (item): item is FilterSummaryDisplayItem => item !== null && !!item,
        ),
    )
    .filter((items) => items.length > 0);

  return summaries;
};

const extractSelectedCategories = (targetPath: string): string[] => {
  const search = getSearchFromTargetPath(targetPath);
  if (!search) {
    return [];
  }

  const params = new URLSearchParams(search);
  const selected = params.get('cats');
  if (!selected) {
    return [];
  }

  const items = selected
    .split(',')
    .map((value) => value.trim())
    .filter((value) => value.length > 0)
    .map((value) => CATEGORY_LABEL_MAP[value] ?? value);

  return Array.from(new Set(items));
};

const extractSortLabel = (targetPath: string): string | null => {
  const search = getSearchFromTargetPath(targetPath);
  if (!search) {
    return null;
  }

  const params = new URLSearchParams(search);
  const sortValue = params.get('sort');
  if (!sortValue) {
    return null;
  }

  const mapped = SORT_LABEL_MAP[sortValue];
  if (mapped) {
    return mapped;
  }

  const normalized = sortValue
    .split('-')
    .filter(Boolean)
    .map(
      (segment) =>
        segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase(),
    )
    .join(' ');

  return normalized || sortValue;
};

const SieveCard = ({
  sieve,
  canManage,
  onEdit,
  onShare,
  onDelete,
  onView,
  extraActions,
}: SieveCardProps) => {
  const createdAt = dayjs(sieve.createdAt).format('MMM D, YYYY');
  const filterSummaries = extractFilterSummaries(sieve.targetPath);
  const sortLabel = extractSortLabel(sieve.targetPath);
  const selectedCategories = extractSelectedCategories(sieve.targetPath);

  const handleViewFeed = () => {
    if (onView) {
      onView(sieve);
      return;
    }

    const targetUrl =
      sieve.share?.url ?? sieve.share?.targetUrl ?? sieve.targetPath;

    if (!targetUrl) {
      return;
    }

    const isAbsolute = /^https?:\/\//i.test(targetUrl);
    const resolvedUrl = isAbsolute
      ? targetUrl
      : `${window.location.origin}${targetUrl.startsWith('/') ? '' : '/'}${targetUrl}`;

    window.open(resolvedUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="mobile:w-auto flex w-full max-w-[800px] flex-col gap-[12px] rounded-[12px] border border-black/[0.08] bg-white p-[16px] shadow-[0_4px_20px_rgba(15,23,42,0.06)]">
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

        {canManage ? (
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
              aria-label="Sieve actions"
              className="min-w-[171px] rounded-[10px] p-[10px] shadow-lg"
              itemClasses={{
                base: 'rounded-[5px] px-[10px] py-[4px] gap-[10px]',
              }}
            >
              <DropdownItem
                key="edit"
                onPress={() => {
                  onEdit?.();
                }}
                endContent={<PencilSimpleIcon size={18} />}
              >
                Edit Sieve
              </DropdownItem>
              <DropdownItem
                key="delete"
                onPress={() => {
                  onDelete?.();
                }}
                className="text-red-500 data-[hover=true]:bg-red-50 data-[hover=true]:text-red-600"
                endContent={<TrashIcon size={18} />}
              >
                Delete Sieve
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        ) : null}
      </div>

      <div className="flex flex-col gap-[12px]">
        {sortLabel && (
          <div className="flex items-center gap-[8px] text-[12px] text-black/55">
            <span className="text-[14px] font-semibold text-black/70">
              Sort
            </span>
            <span className="inline-flex items-center rounded-[6px] bg-[#F1F1F1] px-[8px] py-[4px] text-[12px] font-medium text-black/70">
              {sortLabel}
            </span>
          </div>
        )}

        {selectedCategories.length > 0 && (
          <div className="flex flex-col gap-[8px]">
            <span className="text-[14px] font-semibold text-black/70">
              Sub-categories
            </span>
            <div className="flex flex-wrap gap-[8px]">
              {selectedCategories.map((category) => (
                <span
                  key={`${sieve.id}-sub-category-${category}`}
                  className="inline-flex items-center rounded-[8px] bg-[#F5F5F5] px-[10px] py-[4px] text-[12px] text-black/70"
                >
                  {category}
                </span>
              ))}
            </div>
          </div>
        )}

        {filterSummaries.length > 0 ? (
          <div className="flex flex-col gap-[12px]">
            <span className="text-[14px] font-semibold text-black/70">
              Saved Conditions
            </span>
            {filterSummaries.map((items, index) => (
              <div
                key={`filter-${sieve.id}-${index}`}
                className="flex flex-wrap items-center gap-[14px]"
              >
                {items.map((item, itemIndex) => (
                  <div key={item.id} className="flex items-center gap-[6px]">
                    {itemIndex > 0 && (
                      <span className="text-[11px] font-medium uppercase tracking-[0.24em] text-black/50">
                        {item.connector?.toLowerCase()}
                      </span>
                    )}
                    <span className="inline-flex items-center rounded-[8px] bg-[#F5F5F5] px-[10px] py-[4px] text-[12px] text-black/70">
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <div className="flex w-full justify-end gap-[8px]">
        <Button size="sm" onPress={handleViewFeed}>
          View Sieve
        </Button>
        {extraActions}
        {canManage ? (
          <Button
            color="primary"
            size="sm"
            onPress={() => {
              onShare?.();
            }}
            isDisabled={sieve.share.visibility !== 'public'}
            className="min-w-[120px]"
          >
            Share Sieve
          </Button>
        ) : null}
      </div>
    </div>
  );
};

export default SieveCard;
