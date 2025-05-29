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
      const { groups = [] } = subCategoryConfig;

      // Create a map to find which group each item belongs to
      const itemToGroupMap = new Map<string, { key: string; title: string }>();
      groups.forEach((group) => {
        group.items.forEach((itemKey) => {
          itemToGroupMap.set(itemKey, { key: group.key, title: group.title });
        });
      });

      subCategoryConfig.items.forEach((itemKey) => {
        const proposalItem = proposalItemMap[itemKey];

        const value = proposalItem?.value ? proposalItem.value : 'n/a';
        const refsArray = proposal?.refs as IRef[] | undefined;
        const referenceObj = refsArray?.find((ref) => ref.key === itemKey);
        const referenceValue = referenceObj ? referenceObj.value : '';

        // Check if this item belongs to a group
        const groupInfo = itemToGroupMap.get(itemKey);

        const tableRowItem: ITableProposalItem = {
          key: itemKey,
          property:
            AllItemConfig[itemKey as IEssentialItemKey]?.label || itemKey,
          input: value,
          reference: referenceValue,
          support: proposalItem ? 1 : 0,
          // Add group information if item belongs to a group
          ...(groupInfo && {
            group: groupInfo.key,
            groupTitle: groupInfo.title,
          }),
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
