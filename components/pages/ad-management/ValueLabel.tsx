import { cn } from '@heroui/react';
import { FC, PropsWithChildren } from 'react';

export type IValueLabelType =
  | 'light'
  | 'bordered'
  | 'dark'
  | 'pureText'
  | 'danger';

export interface IValueLabelProps {
  valueLabelType?: IValueLabelType;
  className?: string;
}

const ValueLabel: FC<PropsWithChildren<IValueLabelProps>> = ({
  children,
  valueLabelType = 'light',
  className = '',
}) => {
  const valueLabelClassNames = cn(
    'rounded-[5px] px-[6px] py-[2px] text-[14px] font-semibold text-black/80',
    valueLabelType === 'light' && 'bg-[#F5F5F5]',
    valueLabelType === 'bordered' &&
      'bg-[#F5F5F5] border border-black/10 bg-transparent',
    valueLabelType === 'dark' && 'bg-black text-white/80',
    valueLabelType === 'pureText' && 'bg-transparent',
    valueLabelType === 'danger' && 'bg-[rgba(199,24,24,0.20)] text-[#C71818]',
  );
  return (
    <span className={cn(valueLabelClassNames, className)}>{children}</span>
  );
};

export default ValueLabel;
