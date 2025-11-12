'use client';

import { Fragment } from 'react';

import {
  buildFilterSummary,
  type AdvancedFilterCard,
} from '@/components/pages/project/customFilters/utils';
import { SORT_OPTIONS } from '@/components/pages/project/filterAndSort/types';
import { AllCategories } from '@/constants/category';
import { getAdvancedFilterCardsFromConditions } from '@/lib/services/sieveFilterService';
import type { StoredSieveFilterConditions } from '@/types/sieve';

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

interface FilterConditionsDisplayProps {
  conditions: StoredSieveFilterConditions;
}

const renderAdvancedSummary = (filters: AdvancedFilterCard[]) => {
  if (!filters.length) {
    return null;
  }

  return (
    <div className="flex flex-col gap-[12px]">
      <span className="text-[14px] font-semibold text-black/70">
        Saved Conditions
      </span>
      {filters.map((filter) => {
        const summary = buildFilterSummary(filter);
        if (!summary.items.length) {
          return null;
        }

        return (
          <div
            key={filter.id}
            className="flex flex-wrap items-center gap-[14px]"
          >
            {summary.items.map((item, index) => {
              const connectorLabel = item.connector?.toLowerCase();
              const labelParts = [item.label];
              if (item.operatorLabel) {
                labelParts.push(item.operatorLabel.toLowerCase());
              }
              if (item.valueLabel) {
                labelParts.push(item.valueLabel);
              }

              return (
                <Fragment key={item.id}>
                  {index > 0 && connectorLabel ? (
                    <span className="text-[11px] font-medium uppercase tracking-[0.24em] text-black/45">
                      {connectorLabel}
                    </span>
                  ) : null}
                  <span className="inline-flex items-center rounded-[8px] bg-[#F5F5F5] px-[10px] py-[4px] text-[12px] text-black/70">
                    {labelParts.join(' ')}
                  </span>
                </Fragment>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

const FilterConditionsDisplay = ({
  conditions,
}: FilterConditionsDisplayProps) => {
  const advancedFilters = getAdvancedFilterCardsFromConditions(conditions);
  const sortLabel = conditions.sort
    ? (SORT_LABEL_MAP[conditions.sort] ?? conditions.sort)
    : null;
  const categories = conditions.categories ?? [];
  const searchTerm = conditions.search?.trim()
    ? conditions.search.trim()
    : null;

  return (
    <div className="flex flex-col gap-[16px] rounded-[12px] border border-black/10 bg-white p-[20px]">
      <span className="text-[16px] font-semibold text-black/80">
        Filter Overview
      </span>

      <div className="flex flex-col gap-[12px]">
        {sortLabel ? (
          <div className="flex items-center gap-[8px] text-[12px] text-black/60">
            <span className="text-[13px] font-semibold text-black/75">
              Sort
            </span>
            <span className="inline-flex items-center rounded-[6px] bg-[#F5F5F5] px-[10px] py-[4px] text-[12px] text-black/70">
              {sortLabel}
            </span>
          </div>
        ) : null}

        {categories.length > 0 ? (
          <div className="flex flex-col gap-[8px]">
            <span className="text-[13px] font-semibold text-black/75">
              Sub-categories
            </span>
            <div className="flex flex-wrap gap-[8px]">
              {categories.map((category) => (
                <span
                  key={category}
                  className="inline-flex items-center rounded-[8px] bg-[#F5F5F5] px-[10px] py-[4px] text-[12px] text-black/70"
                >
                  {CATEGORY_LABEL_MAP[category] ?? category}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        {searchTerm ? (
          <div className="flex flex-col gap-[4px]">
            <span className="text-[13px] font-semibold text-black/75">
              Keyword
            </span>
            <span className="inline-flex items-center rounded-[8px] bg-[#F5F5F5] px-[10px] py-[4px] text-[12px] text-black/70">
              {searchTerm}
            </span>
          </div>
        ) : null}

        {renderAdvancedSummary(advancedFilters)}

        {!sortLabel &&
        categories.length === 0 &&
        !searchTerm &&
        advancedFilters.length === 0 ? (
          <span className="text-[12px] text-black/45">
            No additional filters are applied to this sieve.
          </span>
        ) : null}
      </div>
    </div>
  );
};

export default FilterConditionsDisplay;
