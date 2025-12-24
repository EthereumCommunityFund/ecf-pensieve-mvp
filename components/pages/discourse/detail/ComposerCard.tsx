'use client';

import { Button } from '@/components/base';

type ComposerCardProps = {
  title: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  submitLabel: string;
  cancelLabel?: string;
  isSubmitting?: boolean;
  error?: string | null;
};

export function ComposerCard({
  title,
  placeholder,
  value,
  onChange,
  onSubmit,
  onCancel,
  submitLabel,
  cancelLabel = 'Cancel',
  isSubmitting,
  error,
}: ComposerCardProps) {
  return (
    <article className="rounded-[16px] border border-dashed border-black/15 bg-white p-5 shadow-[0px_8px_20px_rgba(15,23,42,0.04)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[15px] font-semibold text-black">{title}</p>
        <Button
          className="text-sm font-semibold text-black/60 hover:text-black"
          variant="light"
          onPress={onCancel}
          isDisabled={isSubmitting}
        >
          {cancelLabel}
        </Button>
      </div>
      <textarea
        className={`mt-4 min-h-[140px] w-full rounded-[12px] border px-4 py-3 text-sm outline-none focus:border-black ${
          error ? 'border-[#d14343]' : 'border-black/15'
        }`}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={isSubmitting}
      />
      {error ? (
        <p className="mt-2 text-xs text-[#d14343]">{error}</p>
      ) : (
        <p className="mt-2 text-xs text-black/50">
          Markdown is supported. Keep it factual and actionable.
        </p>
      )}
      <div className="mt-4 flex justify-end">
        <Button
          className="rounded-[10px] bg-black px-5 py-2 text-sm font-semibold text-white hover:bg-black/85 disabled:bg-black/40"
          onPress={onSubmit}
          isDisabled={isSubmitting}
        >
          {submitLabel}
        </Button>
      </div>
    </article>
  );
}
