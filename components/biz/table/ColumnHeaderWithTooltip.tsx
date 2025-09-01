import { FC } from 'react';

import TooltipWithQuestionIcon from '@/components/biz/FormAndTable/TooltipWithQuestionIcon';

export interface IColumnHeaderWithTooltipProps {
  label: string;
  tooltip?: string;
}

const ColumnHeaderWithTooltip: FC<IColumnHeaderWithTooltipProps> = ({
  label,
  tooltip,
}) => {
  if (!tooltip) {
    return <span>{label}</span>;
  }

  return (
    <div className="flex items-center gap-[6px]">
      <span>{label}</span>
      <TooltipWithQuestionIcon content={tooltip} />
    </div>
  );
};

export default ColumnHeaderWithTooltip;
