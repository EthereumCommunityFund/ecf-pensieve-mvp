'use client';

import React from 'react';

import { IRef } from '@/components/pages/project/create/types';
import { cn } from '@/lib/utils';
import { IProposal } from '@/types';
import { IItemCategoryEnum } from '@/types/item';

import { CollapseButton, FilterButton, MetricButton } from '../ActionButtons';
import { FIELD_LABELS, TableFieldCategory } from '../constants';
import { CategoryKey, ITableProposalItem } from '../ProposalDetails';

// 表格头部组件
interface CategoryHeaderProps {
  title: string;
  description: string;
  category: IItemCategoryEnum;
  isExpanded: boolean;
  onToggle: () => void;
}

export const CategoryHeader: React.FC<CategoryHeaderProps> = ({
  title,
  description,
  category,
  isExpanded,
  onToggle,
}) => {
  return (
    <div
      className={cn(
        'flex items-center justify-between border border-black/10 bg-[rgba(229,229,229,0.70)] p-[10px]',
        isExpanded ? 'rounded-t-[10px]' : 'rounded-[10px]',
      )}
    >
      <div className="flex flex-col gap-[5px]">
        <p className="text-[18px] font-[700] leading-[25px] text-black/80">
          {title}
        </p>
        {description && (
          <p className="text-[13px] font-[600] leading-[18px] text-black/40">
            {description}
          </p>
        )}
      </div>
      <div className="flex items-center justify-end gap-[10px]">
        <CollapseButton isExpanded={isExpanded} onChange={onToggle} />
        <MetricButton onClick={() => {}} />
        <FilterButton onClick={() => {}} />
      </div>
    </div>
  );
};

// 数据处理函数
export const prepareTableData = (proposal?: IProposal) => {
  const result: Record<CategoryKey, ITableProposalItem[]> = {
    [IItemCategoryEnum.Basics]: [],
    [IItemCategoryEnum.Dates]: [],
    [IItemCategoryEnum.Technicals]: [],
    [IItemCategoryEnum.Organization]: [],
  };

  // Iterate over each category defined in CreateProjectStep
  for (const catKey of Object.values(IItemCategoryEnum)) {
    const category = catKey as CategoryKey;
    const categoryItems = TableFieldCategory[category]?.items || [];

    // For each item key defined in the category's items
    categoryItems.forEach((itemKey: string) => {
      // Find the corresponding item from the proposal data, if it exists
      const proposalItem = proposal?.items?.find(
        (pItem: any) => pItem.key === itemKey,
      ) as { key: string; value: any } | undefined;

      const value =
        proposalItem && typeof proposalItem.value !== 'undefined'
          ? proposalItem.value
          : 'N/A';

      const refsArray = proposal?.refs as IRef[] | undefined;
      const referenceObj = refsArray?.find((ref) => ref.key === itemKey);
      const referenceValue = referenceObj ? referenceObj.value : '';

      result[category].push({
        key: itemKey,
        property: FIELD_LABELS[itemKey] || itemKey,
        input: value,
        reference: referenceValue,
        support: proposalItem ? 1 : 0,
      });
    });
  }

  return result;
};
