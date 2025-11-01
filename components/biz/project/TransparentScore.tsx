import { FC } from 'react';

import { ShieldStarIcon } from '@/components/icons';
import {
  AllItemKeysInPage,
  TotalGenesisWeightSum,
  TotalItemCount,
} from '@/constants/tableConfig';
import { ALL_POC_ITEM_MAP, WEIGHT } from '@/lib/constants';
import { IPocItemKey } from '@/types/item';

interface IProps {
  itemsTopWeight: Partial<Record<IPocItemKey, number>>;
}

const VALID_ITEM_KEYS = new Set<IPocItemKey>(AllItemKeysInPage);

export function getValidTransparentItemKeys(
  itemsTopWeight: Partial<Record<IPocItemKey, number>>,
) {
  if (!itemsTopWeight) {
    return [] as IPocItemKey[];
  }

  return Object.keys(itemsTopWeight).filter((key): key is IPocItemKey =>
    VALID_ITEM_KEYS.has(key as IPocItemKey),
  );
}

export function calcTransparentScore(
  itemsTopWeight: Partial<Record<IPocItemKey, number>>,
) {
  const validKeys = getValidTransparentItemKeys(itemsTopWeight);

  const leadingGenesisWeightSum = validKeys.reduce((sum, key) => {
    const item = ALL_POC_ITEM_MAP[key];
    if (item) {
      const genesisWeight = item.accountability_metric * WEIGHT;
      return sum + genesisWeight;
    }
    return sum;
  }, 0);

  if (TotalGenesisWeightSum === 0) return 0;
  return Math.round((leadingGenesisWeightSum / TotalGenesisWeightSum) * 100);
}

const TransparentScore: FC<IProps> = ({ itemsTopWeight }) => {
  const validKeys = getValidTransparentItemKeys(itemsTopWeight);
  const displayedCount = validKeys.length;
  const emptyCount = TotalItemCount - displayedCount;
  const score = calcTransparentScore(itemsTopWeight);
  return (
    <div className="border/black/10 flex h-[26px] items-center gap-[5px] rounded-[4px] border px-[8px] group-hover:bg-black/5">
      <ShieldStarIcon className="size-[20px]" />
      <div className="flex flex-1 flex-wrap items-center justify-between gap-[8px]">
        <div className="flex shrink-0 items-center justify-start gap-[5px] text-[13px] font-[400] leading-[19px] text-black">
          <span>{score}%</span>
        </div>
        <div className="flex shrink-0 items-center justify-start text-[12px] font-[600]  leading-[16px] text-black/40">
          (Items left: <span className="w-[5px]"></span> {emptyCount})
        </div>
      </div>
    </div>
  );
};

export default TransparentScore;
