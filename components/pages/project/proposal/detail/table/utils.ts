'use client';

import { IRef } from '@/components/pages/project/create/types';
import { AllItemConfig } from '@/constants/itemConfig';
import { ProposalTableFieldCategory } from '@/constants/tableConfig';
import { IProposal } from '@/types';
import {
  IEssentialItemKey,
  IItemSubCategoryEnum,
  IPocItemKey,
  IProposalItem,
} from '@/types/item';

import { ITableProposalItem } from '../ProposalDetails';

export const prepareProposalTableData = (
  proposal?: IProposal,
): Record<IItemSubCategoryEnum, ITableProposalItem[]> => {
  const result: Record<IItemSubCategoryEnum, ITableProposalItem[]> =
    ProposalTableFieldCategory.reduce(
      (acc, catConfig) => {
        catConfig.subCategories.forEach((subCatConfig) => {
          acc[subCatConfig.key] = [];
        });
        return acc;
      },
      {} as Record<IItemSubCategoryEnum, ITableProposalItem[]>,
    );

  const proposalItemMap = ((proposal?.items || []) as IProposalItem[]).reduce(
    (acc, item) => {
      acc[item.key] = item;
      return acc;
    },
    {} as Record<string, IProposalItem>,
  );

  ProposalTableFieldCategory.forEach((categoryConfig) => {
    categoryConfig.subCategories.forEach((subCategoryConfig) => {
      subCategoryConfig.items.forEach((itemKey) => {
        const proposalItem = proposalItemMap[itemKey];

        const value = proposalItem?.value ? proposalItem.value : 'n/a';
        const refsArray = proposal?.refs as IRef[] | undefined;
        const referenceObj = refsArray?.find((ref) => ref.key === itemKey);
        const referenceValue = referenceObj ? referenceObj.value : '';

        const tableRowItem: ITableProposalItem = {
          key: itemKey,
          property:
            AllItemConfig[itemKey as IEssentialItemKey]?.label || itemKey,
          input: value,
          reference: referenceValue,
          support: proposalItem ? 1 : 0,
        };
        result[subCategoryConfig.key].push(tableRowItem);
      });
    });
  });

  return result;
};

export const getCategoryByItemKey = (key: IPocItemKey) => {
  const { category, subCategory } = AllItemConfig[key]!;
  const categoryConfig = ProposalTableFieldCategory.find(
    (cat) => cat.key === category,
  );
  const subCategoryConfig = categoryConfig?.subCategories.find(
    (subCat) => subCat.key === subCategory,
  );
  return { categoryConfig, subCategoryConfig };
};
