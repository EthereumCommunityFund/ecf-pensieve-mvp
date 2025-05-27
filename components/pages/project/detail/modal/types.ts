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

// TODO 跟IProjectDataItem统一参数类型
export interface TableRowData {
  id: string;
  input: string;
  reference: string;
  key: string;
  submitter: {
    name: string;
    date: string;
    avatar?: string;
  };
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
