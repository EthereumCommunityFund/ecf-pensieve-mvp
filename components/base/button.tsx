'use client';

import { Button, ButtonProps, cn } from '@heroui/react';

type IButtonSize = 'small' | 'normal' | 'large';

const sizeStyles: Record<IButtonSize, string> = {
  small: 'h-[32px] text-sm',
  normal: 'h-[42px] text-base',
  large: 'h-[48px] text-lg',
};

export interface IButtonProps extends ButtonProps {
  $size?: IButtonSize;
}

function ECFButton({
  className,
  children,
  $size = 'normal',
  ...props
}: IButtonProps) {
  return (
    <Button
      className={cn(
        'flex items-center gap-2',
        'px-5 rounded-[5px] shrink-0',
        'font-bold text-black',
        'bg-[rgba(0,0,0,0.05)] hover:bg-[rgba(0,0,0,0.15)] hover:text-black active:bg-black active:text-white',
        'transition-colors duration-200',
        sizeStyles[$size],
        className,
      )}
      {...props}
    >
      {children}
    </Button>
  );
}

export default ECFButton;
