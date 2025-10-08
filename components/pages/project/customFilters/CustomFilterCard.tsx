import { Fragment, memo } from 'react';
import { PencilSimple } from '@phosphor-icons/react';

import { Button } from '@/components/base/button';
import { CircleXIcon, GearSixIcon } from '@/components/icons';

import { type AdvancedFilterSummary } from './types';

interface CustomFilterCardProps {
  summary: AdvancedFilterSummary;
  onEdit: () => void;
  onRemove?: () => void;
  variant?: 'desktop' | 'mobile';
}

const CustomFilterCard = ({
  summary,
  onEdit,
  onRemove,
  variant = 'desktop',
}: CustomFilterCardProps) => {
  const isMobile = variant === 'mobile';

  return (
    <div
      className={
        'flex flex-col gap-[10px] rounded-[10px] border border-black/10 bg-transparent p-[14px] shadow-none'
      }
    >
      <div className={'flex h-[29px] items-center justify-between pb-[10px]'}>
        <div className="flex items-center gap-[10px]">
          <GearSixIcon width={20} height={20} className="text-black/80" />
          <span className="text-[14px] font-semibold text-black/60">
            Custom Filter
          </span>
        </div>
        <div className="flex items-center gap-[10px]">
          {onRemove && (
            <Button
              isIconOnly
              size="sm"
              onPress={onRemove}
              aria-label="Remove filter"
              className="mr-[-10px] min-w-0 rounded-full border border-black/10 text-black/50 hover:bg-[#F5F5F5] hover:text-black"
            >
              <CircleXIcon width={16} height={16} />
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-[5px]">
        {summary.items.map((item, index) => (
          <Fragment key={item.id}>
            <div className="flex justify-center">
              {index === 0 ? null : (
                <span className="rounded-[4px] bg-[#A5A5A5] px-[4px] py-[2px] text-[10px] font-semibold uppercase tracking-wide text-white">
                  {item.connector}
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-[8px] border-b border-black/10 px-[10px] pb-[10px] shadow-none">
              <span className="rounded-[5px] bg-[#EBEBEB] px-[8px] py-[2px] text-[14px] leading-[16px] text-black">
                {item.label || 'Incomplete condition'}
              </span>
              {item.operatorLabel ? (
                <span className="px-[8px] text-[14px] font-medium leading-[16px] text-black/50">
                  {item.operatorLabel}
                </span>
              ) : null}
              {item.valueLabel ? (
                <span className="rounded-[5px] bg-[#EBEBEB] px-[8px] py-[2px] text-[14px] leading-[16px] text-black">
                  {item.valueLabel}
                </span>
              ) : null}
            </div>
          </Fragment>
        ))}
      </div>

      <div className="flex flex-col gap-[10px] pt-[4px]">
        <Button
          size="sm"
          onPress={onEdit}
          className="flex h-[32px] items-center justify-center gap-[6px] rounded-[6px] border border-black/10  text-[14px] font-semibold text-black/60 "
        >
          {/* <PencilSimpleIcon width={18} height={18} className="opacity-50" /> */}
          <PencilSimple
            weight="fill"
            width={18}
            height={18}
            className="opacity-50"
          />
          Edit Filters
        </Button>
      </div>
    </div>
  );
};

export default memo(CustomFilterCard);
