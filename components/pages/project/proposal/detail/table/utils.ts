'use client';

import { IRef } from '@/components/pages/project/create/types';
import { IProposal } from '@/types';
import { IItemCategoryEnum } from '@/types/item';

import { FIELD_LABELS, TableFieldCategory } from '../constants';
import { CategoryKey, ITableProposalItem } from '../ProposalDetails';

export const prepareTableData = (proposal?: IProposal) => {
  const result: Record<CategoryKey, ITableProposalItem[]> = {
    [IItemCategoryEnum.Basics]: [],
    [IItemCategoryEnum.Technicals]: [],
    [IItemCategoryEnum.Organization]: [],
    [IItemCategoryEnum.Financial]: [],
  };

  if (!proposal) {
    return result;
  }

  for (const catKey of Object.values(IItemCategoryEnum)) {
    const category = catKey as CategoryKey;
    const categoryItems = TableFieldCategory[category]?.items || [];

    categoryItems.forEach((itemKey: string) => {
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
