import { Tooltip } from '@heroui/react';
import { FC } from 'react';

import { CoinVerticalIcon } from '@/components/icons';

interface IProps {
  itemWeight: string | number;
  isGenesis?: boolean;
  isEmptyItem?: boolean;
}

const TooltipItemWeight: FC<IProps> = ({
  itemWeight,
  isGenesis,
  isEmptyItem,
}) => {
  return (
    <Tooltip
      content={<ItemWeightTip itemWeight={itemWeight} isGenesis={isGenesis} />}
      classNames={{
        content: 'p-[10px] rounded-[5px] border border-black/10',
      }}
      closeDelay={0}
    >
      {isEmptyItem ? (
        <div className="flex items-center gap-[2px] opacity-50">
          <CoinVerticalIcon />
          <span className="text-[12px] font-[600] leading-[16px] text-black">
            {itemWeight}
          </span>
        </div>
      ) : (
        <div className="rounded-[4px] border border-black px-[4px] py-[2px] text-[12px] font-[600] leading-[16px] text-black opacity-50">
          {itemWeight}
        </div>
      )}
    </Tooltip>
  );
};

const ItemWeightTip = ({
  itemWeight,
  isGenesis,
}: {
  itemWeight: string | number;
  isGenesis?: boolean;
}) => {
  return (
    <div className="flex max-w-[240px] flex-col gap-[5px]">
      <div className="font-mona flex items-center justify-between text-[14px] font-[500] text-black">
        <span className="italic">
          {isGenesis ? 'Genesis ' : ''} Item Weight:
        </span>
        <span>{itemWeight}</span>
      </div>
      <div className="text-[13px] text-black/80">
        {isGenesis ? 'Genesis ' : ''} Item Weight represents the importance of a
        given item. This initial weight needs to be exceeded in order to pass
        its verification.
      </div>
    </div>
  );
};

export default TooltipItemWeight;
