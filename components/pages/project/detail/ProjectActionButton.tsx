import { cn } from '@heroui/react';

import { Button, IButtonProps } from '@/components/base';

interface IProjectActionButtonProps extends Omit<IButtonProps, 'ref'> {
  children?: React.ReactNode;
}

const ProjectActionButton = ({
  children,
  className,
  ...props
}: IProjectActionButtonProps) => {
  return (
    <Button
      className={cn(
        'rounded-[5px] bg-[#F5F5F5] hover:bg-[#EBEBEB] border border-black/10 size-[40px] p-[8px] min-w-0 mobile:size-[32px] mobile:p-[6px]',
        className,
      )}
      {...props}
    >
      {children}
    </Button>
  );
};

export default ProjectActionButton;
