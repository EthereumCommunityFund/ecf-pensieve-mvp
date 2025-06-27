import { FC } from 'react';

import { AllItemConfig } from '@/constants/itemConfig';
import { IPocItemKey } from '@/types/item';

export interface IItemWeightProps {
  itemKey: IPocItemKey;
  itemName: string;
  itemWeight: number;
}

const ItemWeight: FC<IItemWeightProps> = ({
  itemName,
  itemWeight,
  itemKey,
}) => {
  const itemConfig = AllItemConfig[itemKey as IPocItemKey];
  const initialItemWeight = Number(itemConfig?.weight);
  const isBiggerThanInitialItemWeight = itemWeight > initialItemWeight;
  return (
    <div className="flex items-center gap-[10px]">
      <div className="font-mona text-[16px] font-[700] leading-[20px] text-black/80">
        {itemName}
      </div>
      <div className="rounded-[4px] border border-black/10 bg-black px-[10px] py-[5px] text-[15px] font-[600] leading-[20px] text-white">
        Weight: {itemWeight}
      </div>
      {isBiggerThanInitialItemWeight ? (
        <div className="text-[14px] text-black/40">
          +{itemWeight - initialItemWeight}
        </div>
      ) : null}
    </div>
  );
};

export default ItemWeight;
