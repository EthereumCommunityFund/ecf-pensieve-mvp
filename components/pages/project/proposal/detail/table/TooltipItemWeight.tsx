import { Tooltip } from '@heroui/react';
import { FC } from 'react';

interface IProps {
  itemWeight: string | number;
}

const TooltipItemWeight: FC<IProps> = ({ itemWeight }) => {
  return (
    <Tooltip
      content={<ItemWeightTip itemWeight={itemWeight} />}
      classNames={{
        content: 'p-[10px] rounded-[5px] border border-black/10',
      }}
    >
      <div className="rounded-[4px] border border-black px-[4px] py-[2px] text-[12px] font-[600] leading-[16px] text-black opacity-50">
        00
      </div>
    </Tooltip>
  );
};

const ItemWeightTip = ({ itemWeight }: { itemWeight: string | number }) => {
  return (
    <div className="flex max-w-[240px] flex-col gap-[5px]">
      <div className="font-mona flex items-center justify-between text-[14px] font-[500] text-black">
        <span className="italic">Starting Item Weight:</span>
        <span>{itemWeight}</span>
      </div>
      <div className="text-[13px] text-black/80">
        Starting Item Weight represents the importance of a given item. This
        initial weight needs to be exceeded in order to pass its verification.
      </div>
    </div>
  );
};

export default TooltipItemWeight;
