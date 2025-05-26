'use client';

import { IRef } from '@/components/pages/project/create/types';
import { AllItemConfig } from '@/constants/itemConfig';
import { IProposal } from '@/types';
import {
  IEssentialItemKey,
  IItemSubCategoryEnum,
  IProposalItem,
} from '@/types/item';

import { TableFieldCategory } from '../constants';
import { ITableProposalItem } from '../ProposalDetails';

export const prepareTableData = (
  proposal?: IProposal,
): Record<IItemSubCategoryEnum, ITableProposalItem[]> => {
  const result: Record<IItemSubCategoryEnum, ITableProposalItem[]> =
    TableFieldCategory.reduce(
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

  TableFieldCategory.forEach((categoryConfig) => {
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

export const getCategoryByItemKey = (key: string) => {
  const { category, subCategory } = AllItemConfig[key as IEssentialItemKey];
  const categoryConfig = TableFieldCategory.find((cat) => cat.key === category);
  const subCategoryConfig = categoryConfig?.subCategories.find(
    (subCat) => subCat.key === subCategory,
  );
  return { categoryConfig, subCategoryConfig };
};
