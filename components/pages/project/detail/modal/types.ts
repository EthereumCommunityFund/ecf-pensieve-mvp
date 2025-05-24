export interface SwitchVoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitEntry?: () => void;
  itemName?: string;
  itemKey?: string; // 添加 itemKey 以便获取具体的项目数据
  itemWeight?: number;
  currentWeight?: number;
  userWeight?: number;
}

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
