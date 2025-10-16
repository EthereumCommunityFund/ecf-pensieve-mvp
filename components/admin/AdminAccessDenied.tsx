'use client';

import { Button } from '@/components/base/button';

type AdminAccessDeniedProps = {
  title: string;
  description: string;
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
};

export const AdminAccessDenied = ({
  title,
  description,
  primaryActionLabel,
  onPrimaryAction,
  secondaryActionLabel,
  onSecondaryAction,
}: AdminAccessDeniedProps) => {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-5 text-center">
      <div className="flex flex-col gap-3">
        <h2 className="text-[22px] font-semibold leading-[28px] text-black">
          {title}
        </h2>
        <p className="max-w-[420px] text-[14px] leading-[22px] text-black/70">
          {description}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {primaryActionLabel && (
          <Button
            size="md"
            color="primary"
            className="min-w-[160px]"
            onPress={onPrimaryAction}
          >
            {primaryActionLabel}
          </Button>
        )}
        {secondaryActionLabel && (
          <Button
            size="md"
            className="min-w-[160px] bg-transparent text-black hover:bg-black/10"
            onPress={onSecondaryAction}
          >
            {secondaryActionLabel}
          </Button>
        )}
      </div>
    </div>
  );
};
