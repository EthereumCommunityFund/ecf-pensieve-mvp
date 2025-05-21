import { POC_ITEMS } from './pocItems';

export const REWARD_PERCENT = 0.2;
export const WEIGHT = 10;
export const ESSENTIAL_ITEM_WEIGHT_AMOUNT =
  Object.values(POC_ITEMS)
    .filter((item) => item.isEssential)
    .reduce((sum, item) => sum + (item.accountability_metric || 0), 0) * WEIGHT;
export const QUORUM_AMOUNT = 3;

export const ESSENTIAL_ITEM_LIST = Object.keys(POC_ITEMS)
  .filter((key) => POC_ITEMS[key as keyof typeof POC_ITEMS].isEssential)
  .map((key) => ({
    key,
    weight:
      POC_ITEMS[key as keyof typeof POC_ITEMS].accountability_metric * WEIGHT,
    quorum: QUORUM_AMOUNT,
    ...POC_ITEMS[key as keyof typeof POC_ITEMS],
  }));

export const ESSENTIAL_ITEM_AMOUNT = ESSENTIAL_ITEM_LIST.length;

export const ESSENTIAL_ITEM_MAP = ESSENTIAL_ITEM_LIST.reduce(
  (acc, item) => {
    acc[item.key as keyof typeof POC_ITEMS] = item;
    return acc;
  },
  {} as Record<string, (typeof ESSENTIAL_ITEM_LIST)[number]>,
);

export const ESSENTIAL_ITEM_WEIGHT_SUM = ESSENTIAL_ITEM_LIST.reduce(
  (acc, item) => acc + item.weight,
  0,
);

export const ESSENTIAL_ITEM_QUORUM_SUM = ESSENTIAL_ITEM_LIST.reduce(
  (acc, item) => acc + item.quorum,
  0,
);
