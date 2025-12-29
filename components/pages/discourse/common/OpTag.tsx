type OpTagProps = {
  label?: string;
  className?: string;
};

export function OpTag({ label = 'OP', className = '' }: OpTagProps) {
  const base =
    'inline-flex h-[20px] items-center rounded-[4px] bg-[rgba(67,189,155,0.1)] px-[4px] text-[13px] font-semibold text-[#1b9573]';
  return <span className={`${base} ${className}`.trim()}>{label}</span>;
}
