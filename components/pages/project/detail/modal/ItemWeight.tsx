import { FC } from 'react';

export interface IItemWeightProps {
  itemName: string;
  itemWeight: number;
}

const ItemWeight: FC<IItemWeightProps> = ({ itemName, itemWeight }) => {
  return (
    <div className="flex items-center gap-[10px]">
      <div className="font-mona text-[16px] font-[700] leading-[20px] text-black/80">
        {itemName}
      </div>
      <div className="rounded-[4px] border border-black/10 bg-black/5 px-[8px] py-[2px] text-[14px] font-[600] leading-[20px] text-black/80">
        Weight: {itemWeight}
      </div>
    </div>
  );
};

export default ItemWeight;
