import { cn } from '@heroui/react';
import { FC } from 'react';

interface IProps {
  classname?: string;
}

const PublishingTip: FC<IProps> = ({ classname = '' }) => {
  return (
    <div
      className={cn(
        'mt-[20px] mx-[20px] mobile:mx-[10px] rounded-[10px] bg-orange-100 p-[10px] text-[13px] text-black/80 text-center',
        classname,
      )}
    >
      <strong>Attention:</strong> The project is currently being published. This
      process may take up to 15 minutes.
    </div>
  );
};

export default PublishingTip;
