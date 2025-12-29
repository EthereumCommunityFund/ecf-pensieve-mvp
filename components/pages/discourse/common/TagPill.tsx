type TagPillProps = {
  children: React.ReactNode;
  className?: string;
};

export function TagPill({ children, className = '' }: TagPillProps) {
  const base =
    'inline-flex h-[24px] items-center rounded-[4px] border border-[rgba(67,189,155,0.6)] bg-[rgba(67,189,155,0.1)] px-2 text-[13px] font-semibold text-[rgba(27,149,115,0.8)]';
  return <span className={`${base} ${className}`.trim()}>{children}</span>;
}
