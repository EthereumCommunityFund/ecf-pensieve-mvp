import { Fragment, memo } from 'react';
import { PlusCircle } from '@phosphor-icons/react';

import { Button } from '@/components/base/button';
import { GearSixIcon } from '@/components/icons';

import CustomFilterCard from './CustomFilterCard';
import { type AdvancedFilterCard } from './types';
import { buildFilterSummary } from './utils';

interface CustomFilterPanelProps {
  filters: AdvancedFilterCard[];
  onCreate: () => void;
  onEdit: (id: string) => void;
  onRemove: (id: string) => void;
  onClearAll?: () => void;
  variant?: 'desktop' | 'mobile';
  isDisabled?: boolean;
  disabledReason?: string;
}

const CustomFilterPanel = ({
  filters,
  onCreate,
  onEdit,
  onRemove,
  onClearAll,
  variant = 'desktop',
  isDisabled = false,
  disabledReason,
}: CustomFilterPanelProps) => {
  const summaries = filters.map((filter) => buildFilterSummary(filter));

  return (
    <div className="flex flex-col gap-[10px]">
      {summaries.length === 0 ? (
        <div className="flex flex-col gap-[12px] rounded-[10px] border border-black/10 bg-transparent p-[14px] text-center">
          <div className="flex items-center gap-[10px]">
            <GearSixIcon
              width={20}
              height={20}
              className="text-black opacity-80"
            />
            <span className="text-[14px] font-[600] text-black/60">
              Custom Filter
            </span>
          </div>
          <Button
            size="sm"
            color="secondary"
            onPress={onCreate}
            isDisabled={isDisabled}
            className={`flex h-[30px] items-center justify-center gap-[5px] rounded-[5px] border text-[14px] font-semibold text-black/60`}
          >
            <PlusCircle className="size-[20px] opacity-50" />
            Create Filter
          </Button>
          {isDisabled && disabledReason && (
            <p className="text-[11px] text-[#D14343]">{disabledReason}</p>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-[12px]">
          {summaries.map((summary, index) => (
            <Fragment key={summary.id}>
              <CustomFilterCard
                summary={summary}
                onEdit={() => onEdit(summary.id)}
                onRemove={() => onRemove(summary.id)}
                variant={variant}
              />
              {/* {index < summaries.length - 1 && (
                <div className="flex items-center justify-center mt-[10px]">
                  <span className="rounded-[2px] bg-black/50 px-[4px] py-[2px] text-[10px] font-semibold uppercase tracking-wide text-white">
                    AND
                  </span>
                </div>
              )} */}
            </Fragment>
          ))}

          <div className="flex flex-col gap-[12px] rounded-[10px] border border-black/10 bg-transparent p-[14px] text-center">
            <div className="flex items-center gap-[10px]">
              <GearSixIcon
                width={20}
                height={20}
                className="text-black opacity-80"
              />
              <span className="text-[14px] font-[600] text-black/60">
                Custom Filter
              </span>
            </div>
            <Button
              size="sm"
              onPress={onCreate}
              isDisabled={isDisabled}
              className={`flex h-[30px] items-center justify-center gap-[5px] rounded-[5px] border text-[14px] font-semibold text-black/60`}
            >
              <PlusCircle className="size-[20px] opacity-50" />
              Create Filter
            </Button>
          </div>

          <div className="flex items-center justify-center text-[11px] text-black/45">
            {onClearAll && (
              <Button
                size="sm"
                onPress={onClearAll}
                className="h-auto border-none bg-transparent p-0 text-[11px] font-semibold text-black/40 hover:bg-transparent hover:text-black"
              >
                Clear All Custom Filters
              </Button>
            )}
          </div>
          {isDisabled && disabledReason && (
            <p className="text-[11px] text-[#D14343]">{disabledReason}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default memo(CustomFilterPanel);
