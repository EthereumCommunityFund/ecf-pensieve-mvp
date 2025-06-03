'use client';

import { Avatar, cn } from '@heroui/react';
import { ReactNode, memo } from 'react';

import { Button } from '@/components/base';
import {
  CaretDownIcon,
  CaretDownYellowIcon,
  CaretUpGreenIcon,
  ClockClockwiseIcon,
  GitPullBlueIcon,
} from '@/components/icons';
import { IKeyItemDataForTable } from '@/components/pages/project/detail/table/ProjectDetailTableColumns';
import VoteItem from '@/components/pages/project/proposal/detail/table/VoteItem';
import { AllItemConfig } from '@/constants/itemConfig';
import { ALL_POC_ITEM_MAP } from '@/lib/constants';
import { IProfileCreator, IProject, IProposal } from '@/types';
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
import TooltipTh from './TooltipTh';

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

export type PropertyColHeaderProps = BaseHeaderProps;

export interface PropertyColCellProps extends BaseCellProps {
  children: ReactNode;
  itemKey?: string; // The key to look up weight in ALL_POC_ITEM_MAP
  showWeight?: boolean; // Whether to show the weight tooltip
  rowData: IKeyItemDataForTable;
}

const PropertyHeader = (_props: PropertyColHeaderProps) => {
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
  const { isConsensusInProgress, isPendingValidation } = rowData;

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
          itemWeight={ALL_POC_ITEM_MAP[itemKey as IPocItemKey].weight}
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

export type InputColHeaderProps = BaseHeaderProps;

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
  onPropose?: () => void;
  onViewProposals?: () => void;
}

const InputHeader = (_props: InputColHeaderProps) => {
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
  onPropose,
  onViewProposals,
}: InputColCellProps) => {
  const itemConfig = AllItemConfig[itemKey];
  const { canBePropose = false, isPendingValidation = false } = item || {};
  const finalDisplayFormType = displayFormType || itemConfig?.formDisplayType;
  const finalIsExpandable =
    isExpandable !== undefined ? isExpandable : itemConfig?.showExpand;

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
  if (showOverTakenStatus) {
    return (
      <div className="font-mona flex w-full items-center justify-between gap-[10px] opacity-70">
        <div className="flex flex-col gap-[5px]">
          <div className="flex items-center gap-[5px]">
            <CaretDownYellowIcon size={16} className="text-[#C47D54]" />
            <span className="font-mona text-[13px] font-semibold leading-[1.54em] text-[#C47D54]">
              Over-taken
            </span>
          </div>
          <div className="text-[13px] leading-[19px]">
            <InputContentRenderer
              itemKey={itemKey}
              value={value}
              displayFormType={finalDisplayFormType}
              isEssential={itemConfig?.isEssential || false}
              isExpandable={finalIsExpandable}
              isRowExpanded={isExpanded}
              onToggleExpanded={onToggleExpand}
            />
          </div>
        </div>
        {finalIsExpandable && (
          <Button
            isIconOnly
            className={cn(
              'size-[24px] shrink-0 opacity-50',
              isExpanded ? 'rotate-180' : '',
            )}
            onPress={onToggleExpand}
          >
            <CaretDownIcon size={18} />
          </Button>
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
              isRowExpanded={isExpanded}
              onToggleExpanded={onToggleExpand}
            />
          </div>
        </div>
        {finalIsExpandable && (
          <Button
            isIconOnly
            className={cn(
              'size-[24px] shrink-0 opacity-50',
              isExpanded ? 'rotate-180' : '',
            )}
            onPress={onToggleExpand}
          >
            <CaretDownIcon size={18} />
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="font-mona flex w-full items-center justify-between gap-[10px]">
      <div className="flex-1 overflow-hidden whitespace-normal break-words text-[13px] leading-[19px] text-black/80">
        <InputContentRenderer
          itemKey={itemKey}
          value={value}
          displayFormType={finalDisplayFormType}
          isEssential={itemConfig?.isEssential || false}
          isExpandable={finalIsExpandable}
          isRowExpanded={isExpanded}
          onToggleExpanded={onToggleExpand}
        />
      </div>

      {finalIsExpandable && (
        <Button
          isIconOnly
          className={cn(
            'size-[24px] shrink-0 opacity-50',
            isExpanded ? 'rotate-180' : '',
          )}
          onPress={onToggleExpand}
        >
          <CaretDownIcon size={18} />
        </Button>
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

export type ReferenceColHeaderProps = BaseHeaderProps;

export interface ReferenceColCellProps extends BaseCellProps {
  hasReference: boolean;
  onShowReference?: () => void;
}

const ReferenceHeader = (_props: ReferenceColHeaderProps) => {
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
}: ReferenceColCellProps) => {
  return (
    <div className="mx-auto flex justify-center">
      {hasReference ? (
        <Button
          color="secondary"
          size="md"
          className="w-[104px] text-[13px] font-[400]"
          onPress={onShowReference}
        >
          Reference
        </Button>
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

export type SubmitterColHeaderProps = BaseHeaderProps;

export interface SubmitterColCellProps extends BaseCellProps {
  item: IKeyItemDataForTable;
  itemConfig: IItemConfig<IPocItemKey>;
  submitter: IProfileCreator;
  data: Date;
}

const SubmitterHeader = (_props: SubmitterColHeaderProps) => {
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
  ({ submitter, item, itemConfig }: SubmitterColCellProps) => {
    const isNonEssential = !itemConfig?.isEssential;
    const isValueEmpty = isInputValueEmpty(item?.input);

    if (isNonEssential && isValueEmpty) {
      return (
        <div className="font-mona flex-1 text-center text-[13px] font-[400] italic leading-[19px] text-black/30">
          empty
        </div>
      );
    }

    const data = item?.createdAt;
    const avatarSrc = submitter.avatarUrl ?? '/images/user/avatar_p.png';

    return (
      <div className="flex items-center gap-[5px]">
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
            {formatDate(data, 'MM/DD/YYYY', '00/00/0000')}
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

export type ActionsColHeaderProps = BaseHeaderProps;

export interface ActionsColCellProps extends BaseCellProps {
  item: IKeyItemDataForTable;
  onView?: (contentType?: 'viewItemProposal' | 'submitPropose') => void;
}

const ActionsHeader = (_props: ActionsColHeaderProps) => {
  return (
    <TooltipTh
      title="Actions"
      tooltipContext="Actions you can take on this item"
    />
  );
};

const ActionsCell = ({ onView, item }: ActionsColCellProps) => {
  const { canBePropose } = item;

  return (
    <div className="flex w-full gap-[10px]">
      {canBePropose ? (
        <Button
          size="sm"
          className="flex-1 border-none bg-[#64C0A5] text-white hover:bg-[#64C0A5]/80"
          onPress={() => onView?.('submitPropose')}
        >
          Propose
        </Button>
      ) : (
        <Button
          color="secondary"
          className="h-[30px] flex-1 rounded-[5px] border-none bg-[#F0F0F0] p-[10px] text-[13px] font-[400]"
          onPress={() => onView?.('viewItemProposal')}
        >
          View
        </Button>
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

export type AccountabilityColHeaderProps = BaseHeaderProps;

export interface AccountabilityColCellProps extends BaseCellProps {
  accountability?: string[];
  onMetricClick?: (metric: string) => void;
}

const AccountabilityHeader = (_props: AccountabilityColHeaderProps) => {
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
  if (!accountability || accountability.length === 0) {
    return (
      <div className="font-mona text-center text-[13px] font-[400] italic leading-[19px] text-black/30">
        empty
      </div>
    );
  }

  return (
    <div className="flex cursor-pointer flex-wrap items-center gap-[10px] py-[10px]">
      {accountability.map((metric, index) => (
        <div
          key={index}
          className="flex cursor-pointer items-center justify-center gap-[10px] rounded-[20px] bg-[#F5F5F5] px-[8px] py-[4px] transition-colors hover:bg-[#E5E5E5]"
          onClick={() => onMetricClick?.(metric)}
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

export type LegitimacyColHeaderProps = BaseHeaderProps;

export interface LegitimacyColCellProps extends BaseCellProps {
  legitimacy?: string[];
  onMetricClick?: (metric: string) => void;
}

const LegitimacyHeader = (_props: LegitimacyColHeaderProps) => {
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
  if (!legitimacy || legitimacy.length === 0) {
    return (
      <div className="font-mona text-center text-[13px] font-[400] italic leading-[19px] text-black/30">
        empty
      </div>
    );
  }

  return (
    <div className="flex cursor-pointer flex-wrap items-center gap-[10px] py-[10px]">
      {legitimacy.map((metric, index) => (
        <div
          key={index}
          className="flex cursor-pointer items-center justify-center gap-[10px] rounded-[20px] bg-[#F5F5F5] px-[8px] py-[4px] transition-colors hover:bg-[#E5E5E5]"
          onClick={() => onMetricClick?.(metric)}
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
