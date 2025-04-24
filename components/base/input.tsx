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
    return (
      <HInput
        {...props}
        ref={ref}
        classNames={{
          base: cn('group'),
          innerWrapper: 'bg-transparent',
          inputWrapper: cn(
            'h-[40px] px-[10px] rounded-[8px]',
            'bg-black/[0.05] hover:bg-black/[0.05] group-data-[focus=true]:bg-black/[0.05]',
            'border border-black/[0.1] focus-within:border-black/[0.4] data-[invalid=true]:border-[rgba(215,84,84,0.8)',
          ),
          input: cn('!text-black', 'placeholder:text-black/60'),
          errorMessage: cn('text-[#D75454]'),
        }}
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
    return (
      <HTextarea
        {...props}
        ref={ref}
        classNames={{
          base: cn('group'),
          inputWrapper: cn(
            'bg-black/[0.05] hover:bg-black/[0.05] group-data-[focus=true]:bg-black/[0.05]',
            'rounded-[8px] p-[10px] min-h-[95px]',
            'border border-black/[0.1] focus-within:border-black/[0.4] data-[invalid=true]:border-[rgba(215,84,84,0.8)',
          ),
          input: cn('!text-black', 'placeholder:text-black/50', 'resize-none'),
          errorMessage: cn('text-[#D75454]'),
        }}
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
