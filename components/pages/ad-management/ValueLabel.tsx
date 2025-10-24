import { cn } from '@heroui/react';
import { FC } from 'react';

export type IValueLabelType = 'light' | 'bordered' | 'dark' | 'pureText';

export interface IValueLabelProps {
  value: string;
  valueLabelType: IValueLabelType;
  className?: string;
}

const ValueLabel: FC<IValueLabelProps> = ({
  valueLabelType,
  value,
  className = '',
}) => {
  const valueLabelClassNames = cn(
    'rounded-[5px] px-[6px] py-[2px] text-[14px] font-semibold text-black/80',
    valueLabelType === 'light' && 'bg-[#F5F5F5]',
    valueLabelType === 'bordered' &&
      'bg-[#F5F5F5] border border-black/10 bg-transparent',
    valueLabelType === 'dark' && 'bg-black text-white/80',
    valueLabelType === 'pureText' && 'bg-transparent',
  );
  return <span className={cn(valueLabelClassNames, className)}>{value}</span>;
};

export default ValueLabel;
