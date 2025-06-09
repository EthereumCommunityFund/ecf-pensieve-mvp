'use client';

import { cn } from '@heroui/react';
import { FC } from 'react';

import { Button } from '@/components/base/button';
import { CaretDownIcon, PencilCircleIcon } from '@/components/icons';

interface ContributeButtonProps {
  onClick: () => void;
}

const ContributeButton: FC<ContributeButtonProps> = ({ onClick }) => {
  return (
    <Button
      className={cn(
        'flex items-center gap-[4px] px-[10px] py-[8px] rounded-[6px]',
        'bg-[rgba(0,0,0,0.05)] hover:bg-[rgba(0,0,0,0.1)]',
        'transition-colors duration-200',
        'h-auto min-w-[250px] border-none',
      )}
      onPress={onClick}
    >
      <div>
        <PencilCircleIcon size={24} />
      </div>
      <div className="text-[15px] font-bold">Contribute to this page</div>
      <div>
        <CaretDownIcon size={16} />
      </div>
    </Button>
  );
};

export default ContributeButton;
