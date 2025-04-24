import {
  cn,
  extendVariants,
  Input as HInput,
  Textarea as HTextarea,
  InputProps,
  TextAreaProps,
} from '@heroui/react';
import React from 'react';

// TODO： input ui
const BaseInput = React.forwardRef<HTMLInputElement, InputProps>(
  (props, ref) => {
    const { classNames, ...rest } = props;
    return (
      <HInput
        ref={ref}
        classNames={{
          base: cn('group', classNames?.base),
          label: cn('text-black/60', classNames?.label),
          mainWrapper: cn(classNames?.mainWrapper),
          innerWrapper: cn('bg-transparent', classNames?.innerWrapper),
          inputWrapper: cn(
            'h-[40px] px-[10px] rounded-[8px]',
            'bg-black/[0.05] hover:bg-black/[0.05] group-data-[focus=true]:bg-black/[0.05]',
            'border border-black/[0.1] focus-within:border-black/[0.4] data-[invalid=true]:border-[rgba(215,84,84,0.8)',
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
          errorMessage: cn('text-[#D75454]', classNames?.errorMessage),
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
            'bg-black/[0.05] hover:bg-black/[0.05] group-data-[focus=true]:bg-black/[0.05]',
            'border border-black/[0.1] focus-within:border-black/[0.4] data-[invalid=true]:border-[rgba(215,84,84,0.8)',
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
          errorMessage: cn('text-[#D75454]', classNames?.errorMessage),
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
  },
});

export { Input, Textarea };
