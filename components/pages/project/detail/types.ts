import { IModalContentType } from '@/app/project/[id]/page';
import { IKeyItemDataForTable } from '@/components/pages/project/detail/table/ProjectDetailTableColumns';
import { IProfile, IProject, IProposalsByProjectIdAndKey } from '@/types';
import { IItemSubCategoryEnum, IPocItemKey } from '@/types/item';

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
  initialTab?: string;
}

export interface ITableMetaOfProjectDetail {
  expandedRows: Record<string, boolean>;
  toggleRowExpanded: (key: string) => void;
  project: IProject;
  onOpenModal?: (
    itemKey: IPocItemKey,
    contentType?: 'viewItemProposal' | 'submitPropose',
  ) => void;
  showReferenceModal?: (ref: string, key: IPocItemKey, reason: string) => void;
  onMetricClick?: (metric: string) => void;
  toggleColumnPinning?: (
    category: IItemSubCategoryEnum,
    columnId: string,
    position?: 'left' | 'right',
  ) => void;
  isColumnPinned?: (
    category: IItemSubCategoryEnum,
    columnId: string,
  ) => 'left' | 'right' | false;
  showSubmitterModal?: (submitter: IProposalCreator, validatedAt: Date) => void;
}

export interface ITableMetaOfDisplayed {
  expandedRows: Record<string, boolean>;
  toggleRowExpanded: (key: string) => void;
  showReferenceModal?: (ref: string, key: IPocItemKey, reason: string) => void;
  showSubmitterModal?: (submitter: IProposalCreator, validatedAt: Date) => void;
}

export interface ITableMetaOfSubmissionQueue {
  expandedRows: Record<string, boolean>;
  toggleRowExpanded: (key: string) => void;
  showReferenceModal?: (ref: string, key: IPocItemKey, reason: string) => void;
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
  onCancelVote: (
    key: IPocItemKey,
    voteRecordId: number,
    itemProposalId: number,
  ) => Promise<void>;
  project?: IProject;
  profile?: IProfile;
  showRowOverTaken?: boolean;
  showRowIsLeading?: boolean;
  isLeadingProposalNotLeading?: boolean;
  inActionKeyMap?: Partial<Record<IPocItemKey, boolean>>;
  inActionItemProposalIdMap?: Record<number, boolean>;
  showSubmitterModal?: (submitter: IProposalCreator, validatedAt: Date) => void;
}

export interface IProjectTableRowData extends IKeyItemDataForTable {
  support: {
    count: number;
    voters: number;
  };
  weight?: number;
  percentage?: number;
  accountabilityMetrics?: string[];
  legitimacyMetrics?: string[];
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

export interface IProposalCreator {
  name: string;
  avatarUrl: string | null;
  userId: string;
  address: string;
}
