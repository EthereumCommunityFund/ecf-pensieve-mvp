'use client';

import { ProposalDetailProvider } from '@/components/pages/project/proposal/detail/context/proposalDetailContext';

const ProposalLayoutClient = ({ children }: { children: React.ReactNode }) => {
  return <ProposalDetailProvider>{children}</ProposalDetailProvider>;
};

export default ProposalLayoutClient;
