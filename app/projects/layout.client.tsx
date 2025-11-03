'use client';

import React from 'react';

import { ProposalProgressModalProvider } from '@/components/biz/modal/proposalProgress/Context';
import ProposalProgressModalRenderer from '@/components/biz/modal/proposalProgress/ModalRenderer';

interface ProjectsLayoutClientProps {
  children: React.ReactNode;
}

const ProjectsLayoutClient = ({ children }: ProjectsLayoutClientProps) => {
  return (
    <ProposalProgressModalProvider>
      <div className="px-[20px] pt-[20px]">
        {children}
        <ProposalProgressModalRenderer />
      </div>
    </ProposalProgressModalProvider>
  );
};

export default ProjectsLayoutClient;
