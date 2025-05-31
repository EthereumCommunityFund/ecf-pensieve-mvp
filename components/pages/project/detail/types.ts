import { IModalContentType } from '@/app/project/[id]/page';
import { IKeyItemDataForTable } from '@/components/pages/project/detail/table/ProjectDetailTableColumns';
import { IProfile, IProject, IProposalsByProjectIdAndKey } from '@/types';
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
  contentType: IModalContentType;
  setModalContentType: (contentType: IModalContentType) => void;
}

export interface ITableMetaOfProjectDetail {
  expandedRows: Record<string, boolean>;
  toggleRowExpanded: (key: string) => void;
  project: IProject;
  onOpenModal?: (
    itemKey: IPocItemKey,
    contentType?: 'viewItemProposal' | 'submitPropose',
  ) => void;
  showReferenceModal?: (ref: string, key: IPocItemKey) => void;
}

export interface ITableMetaOfDisplayed {
  expandedRows: Record<string, boolean>;
  toggleRowExpanded: (key: string) => void;
  showReferenceModal?: (ref: string, key: IPocItemKey) => void;
}

export interface ITableMetaOfSubmissionQueue {
  expandedRows: Record<string, boolean>;
  toggleRowExpanded: (key: string) => void;
  showReferenceModal?: (ref: string, key: IPocItemKey) => void;
  displayProposalDataListOfProject: IKeyItemDataForTable[];
  proposalsByProjectIdAndKey: IProposalsByProjectIdAndKey;
  onCreateItemProposalVote: (
    key: IPocItemKey,
    itemProposalId: number,
  ) => Promise<void>;
  onSwitchItemProposalVote: (
    key: IPocItemKey,
    itemProposalId: number,
  ) => Promise<void>;
  onCancelVote: (key: IPocItemKey, voteRecordId: number) => Promise<void>;
  project?: IProject;
  profile?: IProfile;
  showRowOverTaken?: boolean;
  showRowIsLeading?: boolean;
}

export interface IProjectTableRowData extends IKeyItemDataForTable {
  support: {
    count: number;
    voters: number;
  };
  isExpanded?: boolean;
}

export interface IMetricItem {
  label: string;
  value: string;
  isHighlighted?: boolean;
}

export interface IAccountabilityMetric {
  name: string;
  isExpanded: boolean;
}

export interface IWeb3Metric {
  label: string;
  value: string;
  isHighlighted?: boolean;
}

export interface ILegitimacyMetric {
  name: string;
  isExpanded: boolean;
}

export interface IConsensusLogRowData {
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
    userId?: string;
  };
  weight: {
    current: string;
    change: string;
  };
  isExpanded?: boolean;
}
