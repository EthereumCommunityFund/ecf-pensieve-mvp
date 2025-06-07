import { FC, memo } from 'react';

import { Button } from '@/components/base';
import { InfoIcon } from '@/components/icons';
import { formatWeight } from '@/utils/weight';

interface IUserWeightCardProps {
  weight?: number;
  onInfoClick?: () => void;
  className?: string;
}

/**
 * 用户权重卡片组件
 * 纯 UI 组件，显示用户的贡献点数
 *
 * @param weight - 用户权重值
 * @param onInfoClick - 点击信息图标的回调函数
 * @param className - 额外的 CSS 类名
 */
const UserWeightCard: FC<IUserWeightCardProps> = memo(
  ({ weight = 0, onInfoClick, className = '' }) => {
    return (
      <div
        className={`flex w-full flex-col justify-between gap-[10px] rounded-[10px] border border-black/30 bg-white p-[14px] ${className}`}
      >
        <div className="flex items-center justify-start gap-[5px]">
          <p className="font-mona text-[18px] font-[600] leading-[25px] text-black">
            Your Contribution Points
          </p>
          {onInfoClick && (
            <Button
              isIconOnly
              size="sm"
              onPress={onInfoClick}
              className="size-[20px] min-w-0 opacity-30 transition-opacity hover:bg-transparent hover:opacity-60"
              aria-label="View weight information"
            >
              <InfoIcon size={20} />
            </Button>
          )}
        </div>

        <div className="font-mona text-[20px] font-[600] leading-[28px] text-black">
          {formatWeight(weight)}
        </div>
      </div>
    );
  },
);

UserWeightCard.displayName = 'UserWeightCard';

export default UserWeightCard;
