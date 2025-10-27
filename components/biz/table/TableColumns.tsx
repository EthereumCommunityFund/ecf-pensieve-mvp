'use client';

import { Avatar, cn } from '@heroui/react';
import { ReactNode, memo, useCallback, useEffect, useState } from 'react';
import { isAddress } from 'viem';

import { Button } from '@/components/base';
import { useMetricDetailModal } from '@/components/biz/modal/metricDetail/Context';
import {
  CaretDownIcon,
  CaretUpGreenIcon,
  ClockClockwiseIcon,
  GitPullBlueIcon,
  TrendDownIcon,
} from '@/components/icons';
import { IKeyItemDataForTable } from '@/components/pages/project/detail/table/ProjectDetailTableColumns';
import { IProposalCreator } from '@/components/pages/project/detail/types';
import VoteItem from '@/components/pages/project/proposal/detail/table/VoteItem';
import SablierEntry from '@/components/sablier/SablierEntry';
import { EMBED_TABLE_FORM_TYPES } from '@/constants/embedTable';
import { AllItemConfig } from '@/constants/itemConfig';
import { useAuth } from '@/context/AuthContext';
import { ALL_POC_ITEM_MAP } from '@/lib/constants';
import { IProject, IProposal } from '@/types';
import {
  IEssentialItemKey,
  IFormDisplayType,
  IItemConfig,
  IPocItemKey,
} from '@/types/item';
import { formatDate } from '@/utils/formatters';
import { isInputValueEmpty } from '@/utils/item';

import InputContentRenderer from './InputContentRenderer';
import TooltipItemWeight from './TooltipItemWeight';
import { TooltipTh, TooltipThWithPin } from './TooltipThWithPin';

// Simplified expand button that relies on parent state management
const OptimizedExpandButton = memo(
  ({
    isExpanded,
    onToggleExpand,
  }: {
    isExpanded: boolean;
    onToggleExpand?: () => void;
  }) => {
    return (
      <Button
        isIconOnly
        className={cn(
          'size-[24px] shrink-0 opacity-50 transition-transform duration-200',
          isExpanded ? 'rotate-180' : '',
        )}
        onPress={onToggleExpand}
      >
        <CaretDownIcon size={18} />
      </Button>
    );
  },
);

OptimizedExpandButton.displayName = 'OptimizedExpandButton';

// Common types for all column components
interface BaseHeaderProps {
  width?: number | string;
  isLast?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

interface BaseCellProps {
  width?: number | string;
  isLast?: boolean;
  isLastRow?: boolean;
  className?: string;
  style?: React.CSSProperties;
  minHeight?: number;
}

// =============================================================================
// PropertyCol Components
// =============================================================================

export interface PropertyColHeaderProps extends BaseHeaderProps {
  columnId?: string;
  category?: import('@/types/item').IItemSubCategoryEnum;
  isPinned?: 'left' | 'right' | false;
  onTogglePin?: (
    category: import('@/types/item').IItemSubCategoryEnum,
    columnId: string,
    position?: 'left' | 'right',
  ) => void;
}

export interface PropertyColCellProps extends BaseCellProps {
  children: ReactNode;
  itemKey?: string; // The key to look up weight in ALL_POC_ITEM_MAP
  showWeight?: boolean; // Whether to show the weight tooltip
  rowData: IKeyItemDataForTable;
}

const PropertyHeader = ({
  columnId,
  category,
  isPinned,
  onTogglePin,
}: PropertyColHeaderProps) => {
  // If column pinning is supported, use TooltipThWithPin
  if (columnId && category && onTogglePin) {
    return (
      <TooltipThWithPin
        title="Property"
        tooltipContext="The property name of the project item"
        columnId={columnId}
        category={category}
        isPinned={isPinned}
        onTogglePin={onTogglePin}
      />
    );
  }

  // Fallback to regular TooltipTh
  return (
    <TooltipTh
      title="Property"
      tooltipContext="The property name of the project item"
    />
  );
};

const PropertyCell = ({
  children,
  itemKey,
  showWeight = true,
  rowData,
}: PropertyColCellProps) => {
  const shouldShowWeight =
    showWeight && itemKey && ALL_POC_ITEM_MAP[itemKey as IPocItemKey]?.weight;
  const {
    isConsensusInProgress,
    isPendingValidation,
    itemTopWeight,
    canBePropose,
    isAiCreator,
  } = rowData;

  return (
    <div className="flex w-full items-center justify-between">
      <div className="flex flex-col gap-[5px]">
        <span className="text-[14px] font-[600] leading-[20px] text-black">
          {children}
        </span>
        {isConsensusInProgress && (
          <div className="flex items-center gap-[5px]">
            <ClockClockwiseIcon />
            <span className="font-mona text-[13px] leading-[20px] text-black/50">
              Consensus in progress
            </span>
          </div>
        )}
        {isPendingValidation && (
          <div className="flex items-center gap-[5px]">
            <GitPullBlueIcon />
            <span className="font-mona text-[13px] leading-[20px] text-black/50">
              Pending validation
            </span>
          </div>
        )}
      </div>
      {shouldShowWeight && (
        <TooltipItemWeight
          itemWeight={
            itemTopWeight || ALL_POC_ITEM_MAP[itemKey as IPocItemKey].weight
          }
          genesisWeight={ALL_POC_ITEM_MAP[itemKey as IPocItemKey].weight}
          isEmptyItem={!!canBePropose}
          isAiCreator={isAiCreator}
        />
      )}
    </div>
  );
};

export const PropertyCol = {
  Header: PropertyHeader,
  Cell: PropertyCell,
};

// =============================================================================
// FieldTypeCol Components (Reserved for future use)
// =============================================================================

export type FieldTypeColHeaderProps = BaseHeaderProps;

export interface FieldTypeColCellProps extends BaseCellProps {
  children: ReactNode;
}

const FieldTypeHeader = (_props: FieldTypeColHeaderProps) => {
  return (
    <TooltipTh
      title="Field Type"
      tooltipContext="The type of the field for the project item"
    />
  );
};

const FieldTypeCell = ({ children }: FieldTypeColCellProps) => {
  return (
    <div className="font-mona flex items-center overflow-hidden whitespace-normal break-words text-[13px] leading-[19px] text-black/80">
      {children}
    </div>
  );
};

export const FieldTypeCol = {
  Header: FieldTypeHeader,
  Cell: FieldTypeCell,
};

// =============================================================================
// InputCol Components
// =============================================================================

export interface InputColHeaderProps extends BaseHeaderProps {
  columnId?: string;
  category?: import('@/types/item').IItemSubCategoryEnum;
  isPinned?: 'left' | 'right' | false;
  onTogglePin?: (
    category: import('@/types/item').IItemSubCategoryEnum,
    columnId: string,
    position?: 'left' | 'right',
  ) => void;
}

export interface InputColCellProps extends BaseCellProps {
  value: any;
  item: IKeyItemDataForTable;
  itemKey: IEssentialItemKey;
  displayFormType?: IFormDisplayType;
  isExpandable?: boolean;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  showOverTakenStatus?: boolean;
  showLeadingStatus?: boolean;
  isLeadingProposalNotLeading?: boolean;
  onPropose?: () => void;
  onViewProposals?: () => void;
}

const InputHeader = ({
  columnId,
  category,
  isPinned,
  onTogglePin,
}: InputColHeaderProps) => {
  // If column pinning is supported, use TooltipThWithPin
  if (columnId && category && onTogglePin) {
    return (
      <TooltipThWithPin
        title="Input"
        tooltipContext="The input value provided by the user"
        columnId={columnId}
        category={category}
        isPinned={isPinned}
        onTogglePin={onTogglePin}
      />
    );
  }

  // Fallback to regular TooltipTh
  return (
    <TooltipTh
      title="Input"
      tooltipContext="The input value provided by the user"
    />
  );
};

const InputCell = ({
  value,
  itemKey,
  item,
  displayFormType,
  isExpandable,
  isExpanded = false,
  onToggleExpand,
  showOverTakenStatus = false,
  showLeadingStatus = false,
  isLeadingProposalNotLeading = false,
  onPropose,
  onViewProposals,
}: InputColCellProps) => {
  const itemConfig = AllItemConfig[itemKey];
  const { canBePropose = false, isPendingValidation = false } = item || {};
  const finalDisplayFormType = displayFormType || itemConfig?.formDisplayType;
  const finalIsExpandable =
    isExpandable !== undefined ? isExpandable : itemConfig?.showExpand;

  // Create a shared state for immediate visual feedback
  const [localExpanded, setLocalExpanded] = useState(isExpanded);

  // Sync local state with external state
  useEffect(() => {
    setLocalExpanded(isExpanded);
  }, [isExpanded]);

  // Create a wrapper function that provides immediate feedback
  const handleToggleExpand = useCallback(() => {
    // Immediately update local state for instant visual feedback
    setLocalExpanded(!localExpanded);
    // Then call the external handler
    onToggleExpand?.();
  }, [localExpanded, onToggleExpand]);

  // Check if the cell should be clickable based on display type
  const isTableDisplayType = EMBED_TABLE_FORM_TYPES.includes(
    finalDisplayFormType!,
  );

  if (isPendingValidation) {
    return (
      <div
        className="font-mona flex-1 cursor-pointer text-[13px] font-[600] leading-[20px] text-black"
        onClick={onViewProposals}
      >
        View Proposals
      </div>
    );
  }

  if (canBePropose) {
    return (
      <div
        className="font-mona flex-1 cursor-pointer text-[13px] font-[600] leading-[19px] text-[#64C0A5]"
        onClick={onPropose}
      >
        propose a value
      </div>
    );
  }

  // If showing over-taken status, render special UI
  if (isLeadingProposalNotLeading) {
    return (
      <div className="font-mona flex w-full items-center justify-between gap-[10px] opacity-70">
        <div className="flex flex-col gap-[5px]">
          <div className="flex items-center gap-[5px]">
            <TrendDownIcon size={16} className="text-[#C47D54]" />
            <span className="font-mona text-[13px] font-semibold leading-[1.54em] text-[#C47D54]">
              {showOverTakenStatus ? 'Over-taken' : 'Support Not Sufficient'}
            </span>
          </div>
          <div className="text-[13px] leading-[19px]">
            <InputContentRenderer
              itemKey={itemKey}
              value={value}
              displayFormType={finalDisplayFormType}
              isEssential={itemConfig?.isEssential || false}
              isExpandable={finalIsExpandable}
              isExpanded={localExpanded}
              onToggleExpanded={handleToggleExpand}
            />
          </div>
        </div>
        {finalIsExpandable && (
          <OptimizedExpandButton
            isExpanded={localExpanded}
            onToggleExpand={handleToggleExpand}
          />
        )}
      </div>
    );
  }

  // If showing leading status, render special UI
  if (showLeadingStatus) {
    return (
      <div className="font-mona flex w-full items-center justify-between gap-[10px] opacity-70">
        <div className="flex flex-col gap-[5px]">
          <div className="flex items-center gap-[5px]">
            <CaretUpGreenIcon size={16} className="text-[#408671]" />
            <span className="font-mona text-[13px] font-semibold leading-[1.54em] text-[#408671]">
              Leading
            </span>
          </div>
          <div className="text-[13px] leading-[19px]">
            <InputContentRenderer
              itemKey={itemKey}
              value={value}
              displayFormType={finalDisplayFormType}
              isEssential={itemConfig?.isEssential || false}
              isExpandable={finalIsExpandable}
              isExpanded={localExpanded}
              onToggleExpanded={handleToggleExpand}
            />
          </div>
        </div>
        {finalIsExpandable && (
          <OptimizedExpandButton
            isExpanded={localExpanded}
            onToggleExpand={handleToggleExpand}
          />
        )}
      </div>
    );
  }

  // For table display types, make the entire cell clickable
  if (isTableDisplayType && finalIsExpandable) {
    return (
      <div
        className="font-mona flex w-full cursor-pointer items-center justify-between gap-[10px] transition-colors"
        onClick={handleToggleExpand}
      >
        <div
          className="flex-1 overflow-hidden whitespace-normal break-all text-[13px] leading-[19px] text-black/80"
          style={{ wordBreak: 'break-all', overflowWrap: 'anywhere' }}
        >
          <InputContentRenderer
            itemKey={itemKey}
            value={value}
            displayFormType={finalDisplayFormType}
            isEssential={itemConfig?.isEssential || false}
            isExpandable={finalIsExpandable}
            isExpanded={localExpanded}
            onToggleExpanded={handleToggleExpand}
            isTableCell={true}
          />
        </div>

        {finalIsExpandable && (
          <OptimizedExpandButton
            isExpanded={localExpanded}
            onToggleExpand={handleToggleExpand}
          />
        )}
      </div>
    );
  }

  return (
    <div className="font-mona flex w-full items-center justify-between gap-[10px]">
      <div
        className="flex-1 overflow-hidden whitespace-normal break-all text-[13px] leading-[19px] text-black/80"
        style={{ wordBreak: 'break-all', overflowWrap: 'anywhere' }}
      >
        <InputContentRenderer
          itemKey={itemKey}
          value={value}
          displayFormType={finalDisplayFormType}
          isEssential={itemConfig?.isEssential || false}
          isExpandable={finalIsExpandable}
          isExpanded={localExpanded}
          onToggleExpanded={handleToggleExpand}
        />
      </div>

      {finalIsExpandable && (
        <OptimizedExpandButton
          isExpanded={localExpanded}
          onToggleExpand={handleToggleExpand}
        />
      )}
    </div>
  );
};

export const InputCol = {
  Header: InputHeader,
  Cell: InputCell,
};

// =============================================================================
// ReferenceCol Components
// =============================================================================

export interface ReferenceColHeaderProps extends BaseHeaderProps {
  columnId?: string;
  category?: import('@/types/item').IItemSubCategoryEnum;
  isPinned?: 'left' | 'right' | false;
  onTogglePin?: (
    category: import('@/types/item').IItemSubCategoryEnum,
    columnId: string,
    position?: 'left' | 'right',
  ) => void;
}

export interface ReferenceColCellProps extends BaseCellProps {
  hasReference: boolean;
  onShowReference?: () => void;
  isMatchSablier?: boolean;
}

const ReferenceHeader = ({
  columnId,
  category,
  isPinned,
  onTogglePin,
}: ReferenceColHeaderProps) => {
  // If column pinning is supported, use TooltipThWithPin
  if (columnId && category && onTogglePin) {
    return (
      <TooltipThWithPin
        title="Reference"
        tooltipContext="Reference information for this property"
        columnId={columnId}
        category={category}
        isPinned={isPinned}
        onTogglePin={onTogglePin}
      />
    );
  }

  // Fallback to regular TooltipTh
  return (
    <TooltipTh
      title="Reference"
      tooltipContext="Reference information for this property"
    />
  );
};

const ReferenceCell = ({
  hasReference,
  onShowReference,
  isMatchSablier,
}: ReferenceColCellProps) => {
  return (
    <div className="mx-auto flex justify-center">
      {hasReference ? (
        <div className="flex flex-col items-center gap-[10px]">
          {isMatchSablier && <SablierEntry />}
          <Button
            color="secondary"
            size="md"
            className="w-[104px] text-[13px] font-[400]"
            onPress={onShowReference}
          >
            Reference
          </Button>
        </div>
      ) : (
        <div className="font-mona text-center text-[13px] font-[400] italic leading-[19px] text-black/30">
          empty
        </div>
      )}
    </div>
  );
};

export const ReferenceCol = {
  Header: ReferenceHeader,
  Cell: ReferenceCell,
};

// =============================================================================
// SupportCol Components (Vote/Support functionality)
// =============================================================================

export type SupportColHeaderProps = BaseHeaderProps;

export interface SupportColCellProps extends BaseCellProps {
  fieldKey: IPocItemKey;
  project: IProject;
  proposal: IProposal;
  proposalItem: any; // ITableProposalItem
  itemPoints: number;
  itemPointsNeeded: number;
  isReachQuorum: boolean;
  isReachPointsNeeded: boolean;
  isValidated: boolean;
  votedMemberCount: number;
  isUserVoted: boolean;
  isLoading: boolean;
  isProposalCreator: boolean;
  onVoteAction: () => Promise<void>;
}

const SupportHeader = (_props: SupportColHeaderProps) => {
  return (
    <TooltipTh
      title="Support"
      tooltipContext="Number of supporters for this property"
    />
  );
};

const SupportCell = ({
  fieldKey,
  project,
  proposal,
  proposalItem,
  itemPoints,
  itemPointsNeeded,
  isReachQuorum,
  isReachPointsNeeded,
  isValidated,
  votedMemberCount,
  isUserVoted,
  isLoading,
  isProposalCreator,
  onVoteAction,
}: SupportColCellProps) => {
  return (
    <VoteItem
      fieldKey={fieldKey}
      itemPoints={itemPoints}
      itemPointsNeeded={itemPointsNeeded}
      isReachQuorum={isReachQuorum}
      isReachPointsNeeded={isReachPointsNeeded}
      isValidated={isValidated}
      project={project}
      proposal={proposal}
      proposalItem={proposalItem}
      isUserVoted={isUserVoted}
      isProposalCreator={isProposalCreator}
      votedMemberCount={votedMemberCount}
      onAction={onVoteAction}
    />
  );
};

export const SupportCol = {
  Header: SupportHeader,
  Cell: SupportCell,
};

// =============================================================================
// SubmitterCol Components
// =============================================================================

export interface SubmitterColHeaderProps extends BaseHeaderProps {
  columnId?: string;
  category?: import('@/types/item').IItemSubCategoryEnum;
  isPinned?: 'left' | 'right' | false;
  onTogglePin?: (
    category: import('@/types/item').IItemSubCategoryEnum,
    columnId: string,
    position?: 'left' | 'right',
  ) => void;
}

export interface SubmitterColCellProps extends BaseCellProps {
  item: IKeyItemDataForTable;
  itemConfig: IItemConfig<IPocItemKey>;
  submitter: IProposalCreator;
  data: Date;
  showSubmitterModal?: (submitter: IProposalCreator, validatedAt: Date) => void;
}

const SubmitterHeader = ({
  columnId,
  category,
  isPinned,
  onTogglePin,
}: SubmitterColHeaderProps) => {
  // If column pinning is supported, use TooltipThWithPin
  if (columnId && category && onTogglePin) {
    return (
      <TooltipThWithPin
        title="Submitter"
        tooltipContext="The person who submitted this item"
        columnId={columnId}
        category={category}
        isPinned={isPinned}
        onTogglePin={onTogglePin}
      />
    );
  }

  // Fallback to regular TooltipTh
  return (
    <TooltipTh
      title="Submitter"
      tooltipContext="The person who submitted this item"
    />
  );
};

// Optimized Avatar component with memo to prevent unnecessary re-renders
const OptimizedAvatar = memo(
  ({
    src,
    alt,
    className,
    userId,
  }: {
    src: string;
    alt: string;
    className: string;
    userId: string | number;
  }) => {
    return (
      <Avatar
        key={`avatar-${userId}`} // Stable key based on user ID
        src={src}
        alt={alt}
        className={className}
      />
    );
  },
);

OptimizedAvatar.displayName = 'OptimizedAvatar';

const SubmitterCell = memo(
  ({
    submitter,
    item,
    itemConfig,
    showSubmitterModal,
  }: SubmitterColCellProps) => {
    const isNonEssential = !itemConfig?.isEssential;
    const isValueEmpty = isInputValueEmpty(item?.input);
    const submitterAddress =
      typeof submitter?.address === 'string' ? submitter.address.trim() : '';
    const hasSubmitterAddress =
      submitterAddress.length > 0 && isAddress(submitterAddress);

    if (isNonEssential && isValueEmpty && !hasSubmitterAddress) {
      return (
        <div className="font-mona flex-1 text-center text-[13px] font-[400] italic leading-[19px] text-black/30">
          empty
        </div>
      );
    }

    const data = item?.createdAt;
    const avatarSrc = submitter.avatarUrl ?? '/images/user/avatar_p.png';

    const handleSubmitterClick = () => {
      showSubmitterModal?.(submitter, data);
    };

    return (
      <div
        className={cn(
          'flex items-center gap-[5px]',
          showSubmitterModal ? 'cursor-pointer' : 'cursor-default',
        )}
        onClick={handleSubmitterClick}
      >
        <div className="size-[24px] rounded-full bg-[#D9D9D9]">
          <OptimizedAvatar
            src={avatarSrc}
            alt="avatar"
            className="size-[24px] rounded-full"
            userId={submitter.userId || submitter.address || submitter.name}
          />
        </div>
        <div className="flex flex-col">
          <span className="text-[14px] font-[400] leading-[20px] text-black">
            {submitter.name}
          </span>
          <span className="text-[12px] font-[600] leading-[12px] text-black opacity-60">
            {formatDate(data, 'YYYY-MM-DD', '0000-00-00')}
          </span>
        </div>
      </div>
    );
  },
);

SubmitterCell.displayName = 'SubmitterCell';

export const SubmitterCol = {
  Header: SubmitterHeader,
  Cell: SubmitterCell,
};

// =============================================================================
// ActionsCol Components
// =============================================================================

export interface ActionsColHeaderProps extends BaseHeaderProps {
  columnId?: string;
  category?: import('@/types/item').IItemSubCategoryEnum;
  isPinned?: 'left' | 'right' | false;
  onTogglePin?: (
    category: import('@/types/item').IItemSubCategoryEnum,
    columnId: string,
    position?: 'left' | 'right',
  ) => void;
}

export interface ActionsColCellProps extends BaseCellProps {
  item: IKeyItemDataForTable;
  onView?: (contentType?: 'viewItemProposal' | 'submitPropose') => void;
}

const ActionsHeader = ({
  columnId,
  category,
  isPinned,
  onTogglePin,
}: ActionsColHeaderProps) => {
  // If column pinning is supported, use TooltipThWithPin
  if (columnId && category && onTogglePin) {
    return (
      <TooltipThWithPin
        title="Actions"
        tooltipContext="Actions you can take on this item"
        columnId={columnId}
        category={category}
        isPinned={isPinned}
        onTogglePin={onTogglePin}
      />
    );
  }

  // Fallback to regular TooltipTh
  return (
    <TooltipTh
      title="Actions"
      tooltipContext="Actions you can take on this item"
    />
  );
};

const ActionsCell = ({ onView, item }: ActionsColCellProps) => {
  const { canBePropose, isAiCreator } = item;
  const { profile, showAuthPrompt } = useAuth();

  const handleProposeAction = useCallback(() => {
    if (!profile) {
      showAuthPrompt();
      return;
    }
    onView?.('submitPropose');
  }, [profile, showAuthPrompt, onView]);

  return (
    <div className="flex w-full flex-col gap-[5px]">
      {canBePropose ? (
        <Button
          size="sm"
          className="w-full border-none bg-[#64C0A5] text-white hover:bg-[#64C0A5]/80"
          onPress={handleProposeAction}
        >
          Propose to Earn
        </Button>
      ) : (
        <>
          <Button
            color="secondary"
            className="h-[30px] w-full rounded-[5px] border-none bg-[#F0F0F0] p-[10px] text-[13px] font-[400]"
            onPress={() => onView?.('viewItemProposal')}
          >
            View
          </Button>
          <Button
            color="secondary"
            className={cn(
              'h-[30px] w-full rounded-[5px] border-none p-[10px] text-[13px] font-[400]',
              isAiCreator
                ? 'bg-[#64C0A5] hover:bg-[#64C0A5]/80 text-white'
                : 'bg-[#F0F0F0]',
            )}
            onPress={handleProposeAction}
          >
            {isAiCreator ? 'Propose to earn' : 'Propose Entry'}
          </Button>
        </>
      )}
    </div>
  );
};

export const ActionsCol = {
  Header: ActionsHeader,
  Cell: ActionsCell,
};

// =============================================================================
// AccountabilityCol Components
// =============================================================================

export interface AccountabilityColHeaderProps extends BaseHeaderProps {
  columnId?: string;
  category?: import('@/types/item').IItemSubCategoryEnum;
  isPinned?: 'left' | 'right' | false;
  onTogglePin?: (
    category: import('@/types/item').IItemSubCategoryEnum,
    columnId: string,
    position?: 'left' | 'right',
  ) => void;
}

export interface AccountabilityColCellProps extends BaseCellProps {
  accountability?: string[];
  onMetricClick?: (metric: string) => void;
}

const AccountabilityHeader = ({
  columnId,
  category,
  isPinned,
  onTogglePin,
}: AccountabilityColHeaderProps) => {
  // If column pinning is supported, use TooltipThWithPin
  if (columnId && category && onTogglePin) {
    return (
      <TooltipThWithPin
        title="Accountability Metrics"
        tooltipContext="The accountability metrics associated with this property"
        columnId={columnId}
        category={category}
        isPinned={isPinned}
        onTogglePin={onTogglePin}
      />
    );
  }

  // Fallback to regular TooltipTh
  return (
    <TooltipTh
      title="Accountability Metrics"
      tooltipContext="The accountability metrics associated with this property"
    />
  );
};

const AccountabilityCell = ({
  accountability,
  onMetricClick,
}: AccountabilityColCellProps) => {
  // Use Context for metric modal if onMetricClick is not provided
  const { openMetricModal } = useMetricDetailModal();
  const handleMetricClick = onMetricClick || openMetricModal;
  if (!accountability || accountability.length === 0) {
    return (
      <div className="font-mona text-center text-[13px] font-[400] italic leading-[19px] text-black/30">
        empty
      </div>
    );
  }

  return (
    <div className="flex cursor-pointer flex-wrap items-center gap-[10px]">
      {accountability.map((metric, index) => (
        <div
          key={index}
          className="flex cursor-pointer items-center justify-center gap-[10px] rounded-[20px] bg-[#F5F5F5] px-[8px] py-[4px] transition-colors hover:bg-[#E5E5E5]"
          onClick={() => handleMetricClick(metric)}
        >
          <span className="text-center text-[13px] font-[500] leading-[19px] text-[#333333]">
            {metric}
          </span>
        </div>
      ))}
    </div>
  );
};

export const AccountabilityCol = {
  Header: AccountabilityHeader,
  Cell: AccountabilityCell,
};

// =============================================================================
// LegitimacyCol Components
// =============================================================================

export interface LegitimacyColHeaderProps extends BaseHeaderProps {
  columnId?: string;
  category?: import('@/types/item').IItemSubCategoryEnum;
  isPinned?: 'left' | 'right' | false;
  onTogglePin?: (
    category: import('@/types/item').IItemSubCategoryEnum,
    columnId: string,
    position?: 'left' | 'right',
  ) => void;
}

export interface LegitimacyColCellProps extends BaseCellProps {
  legitimacy?: string[];
  onMetricClick?: (metric: string) => void;
}

const LegitimacyHeader = ({
  columnId,
  category,
  isPinned,
  onTogglePin,
}: LegitimacyColHeaderProps) => {
  // If column pinning is supported, use TooltipThWithPin
  if (columnId && category && onTogglePin) {
    return (
      <TooltipThWithPin
        title="Legitimacy Metrics"
        tooltipContext="The legitimacy metrics associated with this property"
        columnId={columnId}
        category={category}
        isPinned={isPinned}
        onTogglePin={onTogglePin}
      />
    );
  }

  // Fallback to regular TooltipTh
  return (
    <TooltipTh
      title="Legitimacy Metrics"
      tooltipContext="The legitimacy metrics associated with this property"
    />
  );
};

const LegitimacyCell = ({
  legitimacy,
  onMetricClick,
}: LegitimacyColCellProps) => {
  // Use Context for metric modal if onMetricClick is not provided
  const { openMetricModal } = useMetricDetailModal();
  const handleMetricClick = onMetricClick || openMetricModal;
  if (!legitimacy || legitimacy.length === 0) {
    return (
      <div className="font-mona text-center text-[13px] font-[400] italic leading-[19px] text-black/30">
        empty
      </div>
    );
  }

  return (
    <div className="flex cursor-pointer flex-wrap items-center gap-[10px]">
      {legitimacy.map((metric, index) => (
        <div
          key={index}
          className="flex cursor-pointer items-center justify-center gap-[10px] rounded-[20px] bg-[#F5F5F5] px-[8px] py-[4px] transition-colors hover:bg-[#E5E5E5]"
          onClick={() => handleMetricClick(metric)}
        >
          <span className="text-center text-[13px] font-[500] leading-[19px] text-[#333333]">
            {metric}
          </span>
        </div>
      ))}
    </div>
  );
};

export const LegitimacyCol = {
  Header: LegitimacyHeader,
  Cell: LegitimacyCell,
};
