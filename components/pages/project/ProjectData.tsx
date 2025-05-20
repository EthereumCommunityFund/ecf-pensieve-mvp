'use client';

import { cn } from '@heroui/react';
import { FC } from 'react';

import { IProposal } from '@/types';

interface ProjectDataProps {
  projectId: number;
  proposals?: IProposal[];
  isProposalsLoading: boolean;
  isProposalsFetched: boolean;
  onSubmitProposal: () => void;
}

const ProjectData: FC<ProjectDataProps> = ({
  projectId,
  proposals = [],
  isProposalsLoading,
  isProposalsFetched,
  onSubmitProposal,
}) => {
  return (
    <div
      className={cn(
        'mt-[20px] px-[160px] tablet:px-[10px] mobile:px-[10px] pt-[20px] ',
        'flex items-start justify-center gap-[40px] ',
        'tablet:flex-col mobile:flex-col tablet:gap-[20px] mobile:gap-[20px]',
      )}
    ></div>
  );
};

export default ProjectData;
