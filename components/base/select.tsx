import { extendVariants, Select as HSelect, SelectItem } from '@heroui/react';

const Select = extendVariants(HSelect, {
  variants: {
    select: {
      default: {
        trigger:
          'bg-black/[0.05] border border-black/[0.1] rounded-[8px] text-black placeholder:text-black/60',
      },
      invalid: {
        trigger:
          'bg-black/[0.05] rounded-[8px] text-black placeholder:text-black/60',
      },
    },
    isDisabled: {
      true: {
        base: 'opacity-30',
        trigger: 'cursor-not-allowed',
      },
    },
  },
  defaultVariants: {
    select: 'default',
    variant: 'bordered',
  },
});

export { Select, SelectItem };
