import { cn } from '@heroui/react';
import React from 'react';

export type ITypographyType =
  | 'title'
  | 'subtitle1'
  | 'subtitle2'
  | 'body1'
  | 'body2'
  | 'caption';

export interface ITypographyProps
  extends React.HTMLAttributes<HTMLParagraphElement> {
  className?: string;
  children?: React.ReactNode;
  type?: ITypographyType;
}

const typographyStyles: Record<ITypographyType, string> = {
  title: 'text-black text-[38px] leading-[53px] font-saria font-semibold',
  subtitle1: 'text-black text-[24px] leading-[33px] font-semibold',
  subtitle2: 'text-black text-[18px] leading-[29px] font-semibold',
  body1: 'text-black text-[16px] leading-[24px]',
  body2: 'text-black text-[14px] leading-[20x]',
  caption: 'text-black text-[13px]',
};

export default function ECFTypography({
  className,
  children,
  type = 'body1',
  ...props
}: ITypographyProps) {
  return (
    <p className={cn(typographyStyles[type], className)} {...props}>
      {children}
    </p>
  );
}
