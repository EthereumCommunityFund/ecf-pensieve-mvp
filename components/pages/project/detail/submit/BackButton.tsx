import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { ButtonProps as HeroBaseButtonProps } from '@heroui/react';
import { ReactNode } from 'react';

import { Button } from '@/components/base';

interface IBackButtonProps
  extends Omit<HeroBaseButtonProps, 'ref' | 'onPress'> {
  onPress: () => void;
  children?: ReactNode;
}

const BackButton = ({ onPress, children, ...props }: IBackButtonProps) => {
  return (
    <Button
      onPress={onPress}
      className="h-[36px] border-none bg-transparent px-[10px] text-[14px] font-[600] text-black"
      startContent={<ArrowLeftIcon className="size-[20px]" />}
      {...props}
    >
      {children || 'Back'}
    </Button>
  );
};

export default BackButton;
