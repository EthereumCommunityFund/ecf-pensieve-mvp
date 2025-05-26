'use client';

import { IRef } from '@/components/pages/project/create/types';
import { AllItemConfig } from '@/constants/itemConfig';
import { IProposal } from '@/types';
import { IEssentialItemKey, IItemSubCategoryEnum } from '@/types/item';

import { TableFieldCategory } from '../constants';
import { ITableProposalItem } from '../ProposalDetails';

// Local interface as a temporary solution if IProposalItem is not exported from @/types
interface ProposalItem {
  key: string;
  value: any; // Or a more specific type for value if known
}

export const SKELETON_INPUT_VALUE = 'SKELETON_LOADING'; // Export for use in rendering components

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

  const proposalItemMap = ((proposal?.items || []) as ProposalItem[]).reduce(
    (acc, item) => {
      acc[item.key] = item;
      return acc;
    },
    {} as Record<string, ProposalItem>,
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

  console.log('prepareTableData', result);

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
