import { POC_ITEMS } from './pocItems';

export const REWARD_PERCENT = 0.2;
export const WEIGHT = 10;
export const ESSENTIAL_ITEM_WEIGHT_AMOUNT = 100;
export const QUORUM_AMOUNT = 3;
export const ESSENTIAL_ITEM_AMOUNT = Object.values(POC_ITEMS).filter(
  (item) => item.isEssential,
).length;
