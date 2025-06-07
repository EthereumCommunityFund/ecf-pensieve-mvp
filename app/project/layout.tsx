'use client';

import React from 'react';

import { ProposalProgressModalProvider } from '@/components/biz/modal/proposalProgress/Context';
import ProposalProgressModalRenderer from '@/components/biz/modal/proposalProgress/ModalRenderer';
import { UserWeightModalProvider } from '@/components/biz/modal/userWeightCard/Context';
import UserWeightModalRenderer from '@/components/biz/modal/userWeightCard/ModalRenderer';

/**
 * Project Layout
 * 为所有 /project 路由提供 UserWeightModal 和 ProposalProgressModal Context
 */
const ProjectLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <UserWeightModalProvider>
      <ProposalProgressModalProvider>
        <div>
          {children}
          <UserWeightModalRenderer />
          <ProposalProgressModalRenderer />
        </div>
      </ProposalProgressModalProvider>
    </UserWeightModalProvider>
  );
};

export default ProjectLayout;
