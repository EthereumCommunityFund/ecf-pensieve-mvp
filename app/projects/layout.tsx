'use client';

import React from 'react';

import { ProposalProgressModalProvider } from '@/components/biz/modal/proposalProgress/Context';
import ProposalProgressModalRenderer from '@/components/biz/modal/proposalProgress/ModalRenderer';

/**
 * Projects Layout
 * 为所有 /projects 路由提供 ProposalProgressModal Context
 */
const ProjectsLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ProposalProgressModalProvider>
      <div className="px-[20px] pt-[20px]">
        {children}
        <ProposalProgressModalRenderer />
      </div>
    </ProposalProgressModalProvider>
  );
};

export default ProjectsLayout;
