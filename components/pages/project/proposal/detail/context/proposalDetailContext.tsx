'use client';

import { createContext, ReactNode, useContext } from 'react';

import { IProject, IProposal } from '@/types';
import { IPocItemKey } from '@/types/item';
import { IVoteResultOfItem } from '@/utils/proposal';

export interface ProposalDetailContextType {
  isFetchVoteInfoLoading: boolean;
  isVoteActionPending: boolean;
  inActionKeys: Record<IPocItemKey, boolean>;
  getItemVoteResult: (IPocItemKey: string) => IVoteResultOfItem;
  onVoteAction: (item: any) => Promise<void>;
  project?: IProject;
  proposal?: IProposal;
}

const ProposalDetailContext = createContext<
  ProposalDetailContextType | undefined
>(undefined);

export interface ProposalDetailProviderProps {
  children: ReactNode;
  value: ProposalDetailContextType;
}

export const ProposalDetailProvider = ({
  children,
  value,
}: ProposalDetailProviderProps) => {
  return (
    <ProposalDetailContext.Provider value={value}>
      {children}
    </ProposalDetailContext.Provider>
  );
};

export const useProposalDetailContext = () => {
  const context = useContext(ProposalDetailContext);
  if (context === undefined) {
    throw new Error(
      'useProposalDetailContext must be used within a ProposalDetailProvider',
    );
  }
  return context;
};
