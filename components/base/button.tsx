'use client';

import {
  ButtonProps,
  cn,
  extendVariants,
  Button as HButton,
} from '@heroui/react';

type IButtonSize = 'small' | 'normal' | 'large';

const sizeStyles: Record<IButtonSize, string> = {
  small: 'h-[32px] text-sm',
  normal: 'h-[42px] text-base',
  large: 'h-[48px] text-lg',
};

export interface IButtonProps extends ButtonProps {
  $size?: IButtonSize;
}

export function ECFButton({
  className,
  children,
  $size = 'normal',
  ...props
}: IButtonProps) {
  return (
    <HButton
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
    </HButton>
  );
}

export const Button = extendVariants(HButton, {
  variants: {
    color: {
      primary:
        'bg-black hover:bg-black/80 disabled:hover:bg-black/50 text-white',
      secondary:
        'bg-transparent hover:bg-black/10 text-black border border-black/10',
    },
    size: {
      sm: 'px-[10px] py-[6px] h-[32px] text-[14px] leading-[20px] gap-[10px] font-[600]',
      md: 'px-[14px] py-[10px] h-[42px] text-[14px] leading-[20px] gap-[10px] font-[600]',
      lg: 'px-[14px] py-[12px] h-[48px] text-[16px] leading-[24px] gap-[10px] font-[600]',
    },
    radius: {
      sm: 'rounded-[5px]',
      md: 'rounded-[5px]',
      lg: 'rounded-[12px]',
      full: 'rounded-full',
    },
    border: {
      true: 'border border-black/10',
    },
  },

  defaultVariants: {
    color: 'secondary',
    size: 'md',
    radius: 'sm',
  },
});
