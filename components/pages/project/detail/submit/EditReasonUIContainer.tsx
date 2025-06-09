import { Tooltip } from '@heroui/react';
import { FC, PropsWithChildren } from 'react';

import { InfoIcon } from '@/components/icons';

interface IProps extends PropsWithChildren {
  label: string;
  description: string;
}
const EditReasonUIContainer: FC<IProps> = ({
  children,
  label,
  description,
}) => {
  return (
    <div className="flex w-full flex-col gap-[10px]">
      <div className="flex w-full items-center gap-[5px]">
        <span className="text-[16px] font-semibold leading-[1.6] text-black">
          {label}
        </span>
        <Tooltip
          classNames={{
            base: ['bg-transparent'],
            content: [
              'p-[10px] bg-white border border-[rgba(0,0,0,0.1)] rounded-[10px] text-black',
            ],
          }}
          content={
            <div className="flex-col gap-[5px]">
              <div className="font-mona text-[14px] font-[500]">{label}</div>
              <div className="text-[13px] font-[400] opacity-80">
                {description}
              </div>
            </div>
          }
          closeDelay={0}
        >
          <div className="opacity-50">
            <InfoIcon size={20} />
          </div>
        </Tooltip>
      </div>
      <span className="text-[13px] text-black opacity-80">add reason</span>
      {children}
    </div>
  );
};

export default EditReasonUIContainer;
