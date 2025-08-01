import {
  Button,
  Modal as HeroModal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  type ModalProps,
  cn,
} from '@heroui/react';
import React, { forwardRef } from 'react';

import { XCircleIcon } from '@/components/icons';

export const Modal = forwardRef<HTMLDivElement, ModalProps>((props, ref) => {
  const { classNames, motionProps, ...rest } = props;

  const baseStyles = {
    base: cn(
      'bg-[rgba(245,245,245,0.80)] border border-[rgba(0,0,0,0.2)]',
      'rounded-[10px]',
      'backdrop-blur-[5px] transition-all duration-200',
      'shadow-none',
      'w-[400px] m-0 mobile:w-[calc(100vw-32px)] p-[20px] box-content',
      classNames?.base,
    ),
    wrapper: cn('bg-black/40 items-center', 'z-[1100]', classNames?.wrapper),
    backdrop: cn('bg-[rgba(0,0,0,0.2)]', classNames?.backdrop),
    header: cn('p-0 text-[18px] leading-[1.2] font-[600]', classNames?.header),
    body: cn('p-[20px] mobile:p-[10px]', classNames?.body),
    footer: cn(
      'mt-[20px] p-0 justify-between mobile:flex-col',
      classNames?.footer,
    ),
    closeButton: cn('hidden', classNames?.closeButton),
  };

  const defaultMotionProps = {
    variants: {
      enter: {
        y: 0,
        opacity: 1,
        transition: {
          duration: 0.15,
          ease: 'easeOut',
        },
      },
      exit: {
        y: -20,
        opacity: 0,
        transition: {
          duration: 0.15,
          ease: 'easeIn',
        },
      },
    },
    ...motionProps,
  };

  return (
    <HeroModal
      ref={ref}
      classNames={baseStyles}
      motionProps={defaultMotionProps}
      hideCloseButton={true}
      {...rest}
    />
  );
});

Modal.displayName = 'Modal';

export const CommonModalHeader: React.FC<{
  title: string;
  description?: string;
  onClose: () => void;
  isDisabled?: boolean;
  closeIcon?: React.ReactNode;
  classNames?: {
    base?: string;
    title?: string;
    button?: string;
  };
}> = ({
  title,
  description,
  onClose,
  isDisabled,
  classNames = {},
  closeIcon,
}) => {
  return (
    <ModalHeader
      className={cn(
        'flex justify-between',
        description ? 'items-start ' : 'items-center',
        classNames?.base,
      )}
    >
      <div>
        <h3
          className={cn(
            'text-[18px] font-[600] text-black overflow-hidden font-mona',
            classNames?.title,
          )}
        >
          {title}
        </h3>
        {description && (
          <div className="mt-[10px] text-[13px] font-[400] text-black/80">
            {description}
          </div>
        )}
      </div>

      <Button
        isIconOnly
        className={cn(
          'size-auto min-h-0 min-w-0 bg-transparent p-0 opacity-30 shrink-0',
          classNames?.button,
        )}
        onPress={onClose}
        disabled={isDisabled}
      >
        {closeIcon || <XCircleIcon size={24} />}
      </Button>
    </ModalHeader>
  );
};

export { ModalBody, ModalContent, ModalFooter, ModalHeader };
