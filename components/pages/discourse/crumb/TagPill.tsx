'use client';

type TagPillProps = {
  label: string;
};

export function TagPill({ label }: TagPillProps) {
  return (
    <span className="inline-flex items-center rounded-md bg-black/5 px-2.5 py-1 text-[11px] font-semibold text-black/60">
      {label}
    </span>
  );
}
