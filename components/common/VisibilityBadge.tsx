import { cn } from '@heroui/react';

type Visibility = 'public' | 'private';

interface VisibilityBadgeProps {
  visibility: Visibility;
  className?: string;
}

const styles: Record<Visibility, string> = {
  public: 'bg-[#E6F4EA] text-[#1E9E5D] border border-[#9AD7B2]/60',
  private: 'bg-[#FCEEEF] text-[#D14343] border border-[#F1B9BD]/60',
};

const labels: Record<Visibility, string> = {
  public: 'Public',
  private: 'Private',
};

const VisibilityBadge = ({ visibility, className }: VisibilityBadgeProps) => {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-[6px] rounded-[999px] px-[10px] py-[4px] text-[12px] font-semibold uppercase tracking-wide',
        styles[visibility],
        className,
      )}
    >
      {labels[visibility]}
    </span>
  );
};

export default VisibilityBadge;
