import { CheckSquareIcon, SquareIcon } from '@/components/icons';

interface CustomCheckboxProps {
  checked: boolean;
  size?: number;
}

export const CustomCheckbox = ({ checked, size = 24 }: CustomCheckboxProps) => {
  if (checked) {
    return (
      <CheckSquareIcon width={size} height={size} className="text-black" />
    );
  }
  return <SquareIcon width={size} height={size} className="text-black/20" />;
};
