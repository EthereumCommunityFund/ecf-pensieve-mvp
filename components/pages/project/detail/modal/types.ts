import { IProjectDataItem } from '@/components/pages/project/detail/table/Column';
import { IProject } from '@/types';
import { IPocItemKey } from '@/types/item';

export interface IProjectDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitEntry?: () => void;
  itemName?: string;
  itemKey: IPocItemKey;
  itemWeight?: number;
  currentWeight?: number;
  userWeight?: number;
  contentType: 'viewItemProposal' | 'submitPropose';
}

export interface ITableMeta {
  displayProposalData: IProjectDataItem[];
  proposalsByKey: Record<IPocItemKey, IProjectDataItem[]>;
  onCreateVote: (key: IPocItemKey, proposalId: number) => Promise<void>;
  onSwitchVote: (key: IPocItemKey, proposalId: number) => Promise<void>;
  onCancelVote: (key: IPocItemKey, voteRecordId: number) => Promise<void>;
  project?: IProject;
}

export interface TableRowData extends IProjectDataItem {
  support: {
    count: number;
    voters: number;
  };
  isExpanded?: boolean;
}

export interface MetricItem {
  label: string;
  value: string;
  isHighlighted?: boolean;
}

export interface AccountabilityMetric {
  name: string;
  isExpanded: boolean;
}

export interface Web3Metric {
  label: string;
  value: string;
  isHighlighted?: boolean;
}

export interface ConsensusLogRowData {
  id: string;
  dateTime: {
    date: string;
    time: string;
  };
  input: string;
  leadBy: {
    name: string;
    date: string;
    avatar?: string;
  };
  weight: {
    current: string;
    change: string;
  };
  isExpanded?: boolean;
}
