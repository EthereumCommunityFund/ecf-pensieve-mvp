import React from 'react';

import { CheckSelectIcon } from '@/components/icons';

interface SelectCheckItemProps {
  label: string;
  isChecked: boolean;
  showCheck?: boolean;
}

const SelectCheckItem: React.FC<SelectCheckItemProps> = ({
  label,
  isChecked,
  showCheck = true,
}) => {
  return (
    <div className="flex w-full items-center justify-between px-2 py-1">
      <span className="text-sm text-black">{label}</span>
      {showCheck && (
        <div className="flex size-5 items-center justify-center">
          {isChecked && <CheckSelectIcon size={12} className="text-gray-300" />}
        </div>
      )}
    </div>
  );
};

export default SelectCheckItem;
