'use client';

import React from 'react';

import { MetricDetailModalProvider } from '@/components/biz/modal/metricDetail/Context';
import MetricDetailModalRenderer from '@/components/biz/modal/metricDetail/ModalRenderer';
import { ProposalProgressModalProvider } from '@/components/biz/modal/proposalProgress/Context';
import ProposalProgressModalRenderer from '@/components/biz/modal/proposalProgress/ModalRenderer';
import { UserWeightModalProvider } from '@/components/biz/modal/userWeightCard/Context';
import UserWeightModalRenderer from '@/components/biz/modal/userWeightCard/ModalRenderer';

/**
 * Project Layout
 * 为所有 /project 路由提供 UserWeightModal、ProposalProgressModal 和 MetricDetailModal Context
 */
const ProjectLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <UserWeightModalProvider>
      <ProposalProgressModalProvider>
        <MetricDetailModalProvider>
          <div>
            {children}
            <UserWeightModalRenderer />
            <ProposalProgressModalRenderer />
            <MetricDetailModalRenderer />
          </div>
        </MetricDetailModalProvider>
      </ProposalProgressModalProvider>
    </UserWeightModalProvider>
  );
};

export default ProjectLayout;
