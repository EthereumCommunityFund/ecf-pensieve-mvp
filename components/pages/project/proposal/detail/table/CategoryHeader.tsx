import { cn } from '@heroui/react';
import { FC } from 'react';

import { IItemCategoryEnum } from '@/types/item';

import { CollapseButton, FilterButton, MetricButton } from '../ActionButtons';

interface CategoryHeaderProps {
  title: string;
  description: string;
  category: IItemCategoryEnum;
  isExpanded: boolean;
  onToggle: () => void;
}

const CategoryHeader: FC<CategoryHeaderProps> = ({
  title,
  description,
  category,
  isExpanded,
  onToggle,
}) => {
  return (
    <div
      className={cn(
        'flex items-center justify-between border border-black/10 bg-[rgba(229,229,229,0.70)] p-[10px]',
        isExpanded ? 'rounded-t-[10px]' : 'rounded-[10px]',
      )}
    >
      <div className="flex flex-col gap-[5px]">
        <p className="text-[18px] font-[700] leading-[25px] text-black/80">
          {title}
        </p>
        {description && (
          <p className="text-[13px] font-[600] leading-[18px] text-black/40">
            {description}
          </p>
        )}
      </div>
      <div className="flex items-center justify-end gap-[10px]">
        <CollapseButton isExpanded={isExpanded} onChange={onToggle} />
        <MetricButton onClick={() => {}} />
        <FilterButton onClick={() => {}} />
      </div>
    </div>
  );
};

export default CategoryHeader;
