import { FC } from 'react';

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
  return (
    <div className="flex items-center gap-[10px]">
      <div className="font-mona text-[16px] font-[700] leading-[20px] text-black/80">
        {itemName}
      </div>
      <div className="rounded-[4px] border border-black/10 bg-black px-[10px] py-[5px] text-[15px] font-[600] leading-[20px] text-white">
        Weight: {itemWeight}
      </div>
    </div>
  );
};

export default ItemWeight;
