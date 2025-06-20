import {
  cn,
  extendVariants,
  Input as HInput,
  Textarea as HTextarea,
  InputProps,
  TextAreaProps,
} from '@heroui/react';
import React from 'react';

const BaseInput = React.forwardRef<HTMLInputElement, InputProps>(
  (props, ref) => {
    const { classNames, ...rest } = props;
    return (
      <HInput
        ref={ref}
        classNames={{
          base: cn('group outline-none focus:outline-none', classNames?.base),
          label: cn('text-black/60', classNames?.label),
          mainWrapper: cn(classNames?.mainWrapper),
          innerWrapper: cn('bg-transparent', classNames?.innerWrapper),
          inputWrapper: cn(
            'h-[40px] px-[10px] rounded-[8px]',
            'bg-[rgba(0,0,0,0.05)] border border-black/10',
            'hover:border-black/40',
            'group-data-[focus=true]:border-black/40',
            'group-data-[focus=true]:bg-[rgba(0,0,0,0.05)]',
            'group-data-[focus-visible=true]:border-black/40',
            'group-data-[focus-visible=true]:bg-[rgba(0,0,0,0.05)]',
            classNames?.inputWrapper,
          ),
          input: cn(
            '!text-black',
            'placeholder:text-black/60',
            'focus:outline-none',
            classNames?.input,
          ),
          helperWrapper: cn(classNames?.helperWrapper),
          clearButton: cn(classNames?.clearButton),
          description: cn(classNames?.description),
          errorMessage: cn(classNames?.errorMessage),
        }}
        {...rest}
      />
    );
  },
);

BaseInput.displayName = 'BaseInput';

const Input = extendVariants(BaseInput, {
  defaultVariants: {
    size: 'md',
    variant: 'bordered',
  },
  variants: {
    isDisabled: {
      true: {
        base: 'opacity-30',
      },
    },
  },
});

const BaseTextarea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (props, ref) => {
    const { classNames, ...rest } = props;
    return (
      <HTextarea
        ref={ref}
        classNames={{
          base: cn('group', classNames?.base),
          label: cn('text-black/60', classNames?.label),
          mainWrapper: cn(classNames?.mainWrapper),
          innerWrapper: cn('bg-transparent', classNames?.innerWrapper),
          inputWrapper: cn(
            'h-[40px] px-[10px] rounded-[8px] min-h-[95px]',
            'bg-black/[0.05]',
            'border border-black/[0.1]',
            'hover:bg-black/[0.05] focus-within:border-black/[0.4]',
            classNames?.inputWrapper,
          ),
          input: cn(
            '!text-black',
            'placeholder:text-black/60',
            classNames?.input,
          ),
          helperWrapper: cn(classNames?.helperWrapper),
          clearButton: cn(classNames?.clearButton),
          description: cn(classNames?.description),
          errorMessage: cn(classNames?.errorMessage),
        }}
        {...rest}
      />
    );
  },
);

BaseTextarea.displayName = 'BaseTextarea';

const Textarea = extendVariants(BaseTextarea, {
  defaultVariants: {
    size: 'md',
    variant: 'bordered',
  },
  variants: {
    isDisabled: {
      true: {
        base: 'opacity-30',
      },
    },
  },
});

export { Input, Textarea };
