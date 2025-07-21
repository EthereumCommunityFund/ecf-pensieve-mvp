import { FC } from 'react';

import { ShieldStarIcon } from '@/components/icons';
import { AllItemKeysInPage, TotalItemCount } from '@/constants/tableConfig';
import { ALL_POC_ITEM_MAP, WEIGHT } from '@/lib/constants';
import { IPocItemKey } from '@/types/item';

interface IProps {
  itemsTopWeight: Partial<Record<IPocItemKey, number>>;
}

export function calcTransparentScore(
  itemsTopWeight: Partial<Record<IPocItemKey, number>>,
) {
  const totalGenesisWeightSum = AllItemKeysInPage.reduce((sum, key) => {
    const item = ALL_POC_ITEM_MAP[key];
    if (item) {
      const genesisWeight = item.accountability_metric * WEIGHT;
      return sum + genesisWeight;
    }
    return sum;
  }, 0);

  const leadingGenesisWeightSum = Object.keys(itemsTopWeight || {}).reduce(
    (sum, key) => {
      const typedKey = key as IPocItemKey;
      const item = ALL_POC_ITEM_MAP[typedKey];
      if (item) {
        const genesisWeight = item.accountability_metric * WEIGHT;
        return sum + genesisWeight;
      }
      return sum;
    },
    0,
  );

  if (totalGenesisWeightSum === 0) return 0;
  return Math.round((leadingGenesisWeightSum / totalGenesisWeightSum) * 100);
}

const TransparentScore: FC<IProps> = ({ itemsTopWeight }) => {
  const displayedCount = Object.keys(itemsTopWeight || {}).length;
  const emptyCount = TotalItemCount - displayedCount;
  const score = calcTransparentScore(itemsTopWeight);
  return (
    <div className="flex items-center justify-between gap-[5px] rounded-[4px] bg-[#EBEBEB] px-[8px] py-[2px]">
      <ShieldStarIcon className="size-[20px]" />
      <div className="flex flex-1 flex-wrap items-center justify-between gap-[5px]">
        <div className="flex shrink-0 items-center justify-start gap-[5px] text-[13px] font-[400] leading-[19px] text-black">
          Transparency Score:
          <span>{score}%</span>
        </div>
        <div className="flex shrink-0 items-center justify-start gap-[5px] text-[12px] font-[600]  leading-[16px] text-black/40">
          Items left:<span>{emptyCount}</span>
        </div>
      </div>
    </div>
  );
};

export default TransparentScore;
