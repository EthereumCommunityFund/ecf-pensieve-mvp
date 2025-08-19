import { Tooltip } from '@heroui/react';
import { FC } from 'react';

import { QuestionIcon } from '@/components/icons';

export interface IProps {
  content: string;
}

const TooltipWithQuestionIcon: FC<IProps> = ({ content }) => {
  return (
    <Tooltip
      content={content}
      classNames={{
        content: 'p-[10px] rounded-[5px] border border-black/10',
      }}
      closeDelay={0}
    >
      <QuestionIcon size={18} className="shrink-0" />
    </Tooltip>
  );
};

export default TooltipWithQuestionIcon;
