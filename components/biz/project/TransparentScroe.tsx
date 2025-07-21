import { FC } from 'react';

import { ShieldStarIcon } from '@/components/icons';
import { TotalItemCount } from '@/constants/tableConfig';

interface IProps {
  displayedCount: number;
}

const TransparentScore: FC<IProps> = ({ displayedCount }) => {
  const emptyCount = TotalItemCount - displayedCount;
  const score = Math.round((displayedCount / emptyCount) * 100);
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
