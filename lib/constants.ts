import { IPocItem, IPocItemKey } from '@/types/item';

import { POC_ITEMS } from './pocItems';

export const REWARD_PERCENT = 0.2;
export const WEIGHT = 10;
export const ESSENTIAL_ITEM_WEIGHT_AMOUNT =
  Object.values(POC_ITEMS)
    .filter((item) => item.isEssential)
    .reduce((sum, item) => sum + (item.accountability_metric || 0), 0) * WEIGHT;
export const QUORUM_AMOUNT = 3;

export const ALL_POC_ITEM_LIST = Object.keys(POC_ITEMS).map(
  (key) =>
    ({
      key,
      weight:
        Number(POC_ITEMS[key as IPocItemKey].accountability_metric) * WEIGHT,
      quorum: QUORUM_AMOUNT,
      ...POC_ITEMS[key as IPocItemKey],
    }) as IPocItem,
);

export const ALL_POC_ITEM_MAP = ALL_POC_ITEM_LIST.reduce(
  (acc, item) => {
    acc[item.key] = item;
    return acc;
  },
  {} as Record<IPocItemKey, IPocItem>,
);

export const ESSENTIAL_ITEM_LIST = ALL_POC_ITEM_LIST.filter(
  (item) => item.isEssential,
);

export const ESSENTIAL_ITEM_AMOUNT = ESSENTIAL_ITEM_LIST.length;

export const ESSENTIAL_ITEM_WEIGHT_SUM = ESSENTIAL_ITEM_LIST.reduce(
  (acc, item) => acc + item.weight,
  0,
);

export const ESSENTIAL_ITEM_QUORUM_SUM = ESSENTIAL_ITEM_LIST.reduce(
  (acc, item) => acc + item.quorum,
  0,
);
