import { Tooltip } from '@heroui/react';
import Image from 'next/image';
import Link from 'next/link';
import React, { memo, useCallback, useMemo } from 'react';

import { AddressDisplay } from '@/components/base/AddressDisplay';
import TooltipWithQuestionIcon from '@/components/biz/FormAndTable/TooltipWithQuestionIcon';
import { AFFILIATION_TYPE_OPTIONS } from '@/components/biz/table/embedTable/item/AffiliatedProjectsTableItem';
import { CONTRIBUTION_TYPE_OPTIONS } from '@/components/biz/table/embedTable/item/ContributingTeamsTableItem';
import { STACK_INTEGRATION_TYPE_OPTIONS } from '@/components/biz/table/embedTable/item/StackIntegrationsTableItem';
import { ProjectFieldRenderer } from '@/components/biz/table/ProjectFieldRenderer';
import { TableIcon } from '@/components/icons';
import { getChainDisplayInfo } from '@/constants/chains';
import { useProjectNamesByIds } from '@/hooks/useProjectsByIds';
import dayjs from '@/lib/dayjs';
import { IFormDisplayType, IPhysicalEntity, IPocItemKey } from '@/types/item';
import { formatAmount } from '@/utils/formatters';
import {
  extractProjectIds,
  isInputValueEmpty,
  isInputValueNA,
  parseMultipleValue,
  parseValue,
} from '@/utils/item';
import { getRegionLabel } from '@/utils/region';
import { normalizeUrl } from '@/utils/url';
import { EMBED_TABLE_WITH_PROJECT_SELECTOR_TYPES } from '@/constants/embedTable';

import {
  isEmbedTableFormType,
  isEmbedTableFormWithProjectSelector,
} from './embedTable/embedTableUtils';

import { TableCell, TableContainer, TableHeader, TableRow } from './index';

// Helper function to get label from options
export const getOptionLabel = (
  value: string | undefined,
  options: Array<{ value: string; label: string }>,
): string => {
  if (!value) return '-';
  const option = options.find((opt) => opt.value === value);

  // If option not found, format the value as title case with spaces
  if (!option) {
    return value
      .replace(/_/g, ' ') // Replace underscores with spaces
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  return option.label;
};

interface IProps {
  itemKey: IPocItemKey;
  isEssential: boolean;
  value: any;
  displayFormType?: IFormDisplayType;
  isExpandable?: boolean;
  isExpanded?: boolean;
  onToggleExpanded?: () => void;
  isInExpandableRow?: boolean;
  isTableCell?: boolean;
}

const InputContentRenderer: React.FC<IProps> = ({
  value,
  isEssential,
  displayFormType,
  isExpandable,
  isExpanded,
  onToggleExpanded,
  isInExpandableRow,
  isTableCell,
}) => {
  const formatValue =
    typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value;

  // For fundingReceivedGrants, affiliated_projects, contributing_teams, and stack_integrations, extract project IDs
  const projectIds = useMemo((): Array<string | number> => {
    const parsed = parseValue(formatValue);
    if (!parsed || !Array.isArray(parsed)) return [];

    const ids: Array<string | number> = [];

    if (EMBED_TABLE_WITH_PROJECT_SELECTOR_TYPES.includes(displayFormType!)) {
      // special, with two project fields
      if (displayFormType === 'fundingReceivedGrants') {
        parsed.forEach((grant: any) => {
          // Extract from organization and projectDonator fields
          ids.push(...extractProjectIds(grant.organization));
          ids.push(...extractProjectIds(grant.projectDonator));
        });
      } else {
        // treat [project] as project field key
        parsed.forEach((item: any) => {
          // Extract from project field
          ids.push(...extractProjectIds(item.project));
        });
      }
    }

    return [...new Set(ids)]; // Remove duplicates
  }, [displayFormType, formatValue, extractProjectIds]);

  // Fetch project names for organizations, affiliated projects, contributing teams, and stack integrations
  const { projectsMap, isLoading: isLoadingProjects } = useProjectNamesByIds(
    projectIds,
    {
      enabled:
        isEmbedTableFormWithProjectSelector(displayFormType) &&
        projectIds.length > 0,
    },
  );

  const renderContent = useCallback(() => {
    switch (displayFormType) {
      case 'string':
      case 'select':
        return (
          <div
            className="overflow-hidden break-all"
            style={{
              wordBreak: 'break-all',
              overflowWrap: 'anywhere',
            }}
          >
            {formatValue}
          </div>
        );
      case 'stringMultiple': {
        const multipleValues = parseMultipleValue(value);
        const joinedText = multipleValues.join(', ');

        // For expandable fields in collapsed state, show truncated text
        if (isExpandable && !isExpanded) {
          // Don't truncate here, let the outer expandable logic handle it
          return <>{joinedText}</>;
        }

        return <>{joinedText}</>;
      }
      case 'multiContracts': {
        let parsedContracts = [];
        let applicable = true;
        let references = [];

        // Handle different data formats
        if (typeof value === 'string') {
          // Legacy format: string with comma-separated addresses
          const addresses = value
            .split(',')
            .map((addr: string) => addr.trim())
            .filter(Boolean);
          if (addresses.length > 0) {
            parsedContracts = [
              {
                chain: 'ethereum', // Default to Ethereum for legacy data
                addresses: addresses.join(','),
              },
            ];
          }
        } else if (Array.isArray(value)) {
          // Direct array format from form submission
          parsedContracts = value;
        } else if (
          typeof value === 'object' &&
          value !== null &&
          !Array.isArray(value)
        ) {
          // New format with applicable flag and contracts array
          applicable = value.applicable ?? true;
          parsedContracts = value.contracts || [];
          references = value.references || [];

          if (!applicable) {
            return <span className="text-gray-500">N/A</span>;
          }
        }

        if (parsedContracts.length === 0) {
          return <span className="text-gray-400">No contracts</span>;
        }

        // Table view when in expandable row
        if (isInExpandableRow) {
          return (
            <div className="w-full">
              <TableContainer bordered rounded background="white">
                <table className="w-full border-separate border-spacing-0">
                  <thead>
                    <tr className="bg-[#F5F5F5]">
                      <TableHeader width={214} isContainerBordered>
                        <div className="flex items-center gap-[5px]">
                          <span>Chain</span>
                        </div>
                      </TableHeader>
                      <TableHeader isLast isContainerBordered>
                        <div className="flex items-center gap-[5px]">
                          <span>Addresses</span>
                        </div>
                      </TableHeader>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedContracts.map((contract: any, index: number) => {
                      const chainInfo = getChainDisplayInfo(
                        contract.chain || 'ethereum',
                      );
                      // Parse addresses - could be string or array
                      let addressList: string[] = [];
                      if (typeof contract.addresses === 'string') {
                        addressList = contract.addresses
                          .split(',')
                          .map((addr: string) => addr.trim())
                          .filter(Boolean);
                      } else if (Array.isArray(contract.addresses)) {
                        addressList = contract.addresses;
                      }

                      return (
                        <TableRow
                          key={contract.id || `${contract.chain}-${index}`}
                          isLastRow={index === parsedContracts.length - 1}
                        >
                          <TableCell
                            width={214}
                            isContainerBordered
                            isLastRow={index === parsedContracts.length - 1}
                          >
                            {chainInfo.name}
                          </TableCell>
                          <TableCell
                            isLast
                            isContainerBordered
                            isLastRow={index === parsedContracts.length - 1}
                          >
                            {addressList.length > 0 ? (
                              <div className="space-y-1">
                                {addressList.map((address, idx) => (
                                  <div key={idx}>
                                    <AddressDisplay
                                      address={address}
                                      startLength={42} // 显示完整地址（以太坊地址长度为42，包括0x）
                                      endLength={0} // 不截断末尾
                                      className="text-sm"
                                    />
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-gray-400">
                                No addresses
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </tbody>
                </table>
              </TableContainer>
              {references && references.length > 0 && (
                <div className="mt-3 border-t border-gray-200 pt-3">
                  <div className="mb-1 text-xs font-medium text-gray-600">
                    References:
                  </div>
                  <div className="space-y-1">
                    {references.map((ref: string, index: number) => (
                      <Link
                        key={ref || `ref-${index}`}
                        href={ref}
                        target="_blank"
                        rel="noreferrer"
                        className="block truncate text-xs text-blue-600 hover:underline"
                      >
                        {ref}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        }

        // Expandable button view
        if (isExpandable) {
          return (
            <div className="w-full">
              <button
                onClick={(e) => {
                  if (isTableCell) {
                    e.stopPropagation();
                  }
                  onToggleExpanded?.();
                }}
                className={`group flex h-auto items-center gap-[5px] rounded border-none bg-transparent p-0 transition-colors ${isTableCell ? '' : 'hover:opacity-80'}`}
              >
                <TableIcon size={20} color="black" className="opacity-70" />
                <span className="font-sans text-[13px] font-semibold leading-[20px] text-black">
                  {isExpanded ? 'Close Table' : 'View Table'}
                </span>
              </button>
            </div>
          );
        }

        // Default collapsed view - show summary
        const contractSummary = parsedContracts
          .map((contract: any) => {
            const chainInfo = getChainDisplayInfo(contract.chain || 'ethereum');
            let addressCount = 0;
            if (typeof contract.addresses === 'string') {
              addressCount = contract.addresses
                .split(',')
                .filter((addr: string) => addr.trim()).length;
            } else if (Array.isArray(contract.addresses)) {
              addressCount = contract.addresses.length;
            }
            return `${chainInfo.name}: ${addressCount} address${addressCount !== 1 ? 'es' : ''}`;
          })
          .join(', ');

        return <>{contractSummary}</>;
      }
      case 'selectMultiple':
        return <>{parseMultipleValue(value).join(', ')}</>;
      case 'autoComplete':
        return <>{parseMultipleValue(value).join(', ')}</>;
      case 'img':
        return (
          <Image
            src={value}
            alt="img"
            width={40}
            height={40}
            className="size-[40px] shrink-0 rounded-[5px] object-cover"
          />
        );
      case 'link':
        return (
          <Link
            href={normalizeUrl(value)}
            target="_blank"
            rel="noreferrer"
            className="break-all underline"
            style={{
              wordBreak: 'break-all',
              overflowWrap: 'anywhere',
            }}
          >
            {normalizeUrl(value)}
          </Link>
        );
      case 'date':
        // Use UTC to ensure consistent date display across timezones
        return <>{dayjs.utc(value).format('YYYY-MM-DD')}</>;
      case 'founderList': {
        const parsedFounderList = parseValue(value);

        if (!Array.isArray(parsedFounderList)) {
          return <>{parsedFounderList}</>;
        }

        if (isInExpandableRow) {
          return (
            <div className="w-full">
              <TableContainer bordered rounded background="white">
                <table className="w-full border-separate border-spacing-0">
                  <thead>
                    <tr className="bg-[#F5F5F5]">
                      <TableHeader width={214} isContainerBordered>
                        <div className="flex items-center gap-[5px]">
                          <span>Name</span>
                          <div className="flex size-[18px] items-center justify-center rounded bg-white opacity-40">
                            {/* <svg
                              width="18"
                              height="18"
                              viewBox="0 0 18 18"
                              fill="none"
                            >
                              <circle
                                cx="9"
                                cy="9"
                                r="6.75"
                                stroke="black"
                                strokeWidth="1"
                              />
                              <circle
                                cx="9"
                                cy="6.75"
                                r="2.25"
                                stroke="black"
                                strokeWidth="1"
                              />
                              <path
                                d="M9 12.09L9 12.09"
                                stroke="black"
                                strokeWidth="1"
                                strokeLinecap="round"
                              />
                            </svg> */}
                          </div>
                        </div>
                      </TableHeader>
                      <TableHeader isContainerBordered>
                        <div className="flex items-center gap-[5px]">
                          <span>Title/Role</span>
                          <div className="flex size-[18px] items-center justify-center rounded bg-white opacity-40">
                            {/* <svg
                              width="18"
                              height="18"
                              viewBox="0 0 18 18"
                              fill="none"
                            >
                              <circle
                                cx="9"
                                cy="9"
                                r="6.75"
                                stroke="black"
                                strokeWidth="1"
                              />
                              <circle
                                cx="9"
                                cy="6.75"
                                r="2.25"
                                stroke="black"
                                strokeWidth="1"
                              />
                              <path
                                d="M9 12.09L9 12.09"
                                stroke="black"
                                strokeWidth="1"
                                strokeLinecap="round"
                              />
                            </svg> */}
                          </div>
                        </div>
                      </TableHeader>
                      <TableHeader isLast isContainerBordered>
                        <div className="flex items-center gap-[5px]">
                          <span>Country/Region</span>
                          <Tooltip
                            content={
                              <div className="flex flex-col gap-1">
                                <span>
                                  Following{' '}
                                  <a
                                    href="https://www.iso.org/iso-3166-country-codes.html"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600"
                                  >
                                    {` ISO 3166 `}
                                  </a>
                                  standard
                                </span>
                              </div>
                            }
                            classNames={{
                              content:
                                'p-[10px] rounded-[5px] border border-black/10',
                            }}
                            closeDelay={0}
                          >
                            <div className="flex size-[18px] items-center justify-center rounded bg-white opacity-40">
                              <svg
                                width="18"
                                height="18"
                                viewBox="0 0 18 18"
                                fill="none"
                              >
                                <circle
                                  cx="9"
                                  cy="9"
                                  r="6.75"
                                  stroke="black"
                                  strokeWidth="1"
                                />
                                <circle
                                  cx="9"
                                  cy="6.75"
                                  r="2.25"
                                  stroke="black"
                                  strokeWidth="1"
                                />
                                <path
                                  d="M9 12.09L9 12.09"
                                  stroke="black"
                                  strokeWidth="1"
                                  strokeLinecap="round"
                                />
                              </svg>
                            </div>
                          </Tooltip>
                        </div>
                      </TableHeader>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedFounderList.map(
                      (
                        founder: {
                          name: string;
                          title: string;
                          region?: string;
                        },
                        index: number,
                      ) => (
                        <TableRow
                          key={index}
                          isLastRow={index === parsedFounderList.length - 1}
                        >
                          <TableCell
                            width={214}
                            isContainerBordered
                            isLastRow={index === parsedFounderList.length - 1}
                          >
                            {founder.name}
                          </TableCell>
                          <TableCell
                            isContainerBordered
                            isLastRow={index === parsedFounderList.length - 1}
                          >
                            {founder.title}
                          </TableCell>
                          <TableCell
                            isLast
                            isContainerBordered
                            isLastRow={index === parsedFounderList.length - 1}
                          >
                            {getRegionLabel(founder.region)}
                          </TableCell>
                        </TableRow>
                      ),
                    )}
                  </tbody>
                </table>
              </TableContainer>
            </div>
          );
        }

        if (isExpandable) {
          return (
            <div className="w-full">
              <button
                onClick={(e) => {
                  if (isTableCell) {
                    e.stopPropagation();
                  }
                  onToggleExpanded?.();
                }}
                className={`group flex h-auto items-center gap-[5px] rounded border-none bg-transparent p-0 transition-colors ${isTableCell ? '' : 'hover:opacity-80'}`}
              >
                <TableIcon size={20} color="black" className="opacity-70" />
                <span className="font-sans text-[13px] font-semibold leading-[20px] text-black">
                  {isExpanded ? 'Close Table' : 'View Table'}
                </span>
              </button>
            </div>
          );
        }
        break;
      }
      case 'social_links': {
        const parsedSocialLinks = parseValue(value);

        if (!Array.isArray(parsedSocialLinks)) {
          return <>{parsedSocialLinks}</>;
        }

        if (isInExpandableRow) {
          return (
            <div className="w-full">
              <TableContainer bordered rounded background="white">
                <table className="w-full border-separate border-spacing-0">
                  <thead>
                    <tr className="bg-[#F5F5F5]">
                      <TableHeader width={214} isContainerBordered>
                        <div className="flex items-center gap-[5px]">
                          <span>Platform</span>
                        </div>
                      </TableHeader>
                      <TableHeader isLast isContainerBordered>
                        <div className="flex items-center gap-[5px]">
                          <span>URL</span>
                        </div>
                      </TableHeader>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedSocialLinks.map(
                      (
                        link: { platform: string; url: string },
                        index: number,
                      ) => (
                        <TableRow
                          key={index}
                          isLastRow={index === parsedSocialLinks.length - 1}
                        >
                          <TableCell
                            width={214}
                            isContainerBordered
                            isLastRow={index === parsedSocialLinks.length - 1}
                          >
                            {link.platform}
                          </TableCell>
                          <TableCell
                            isLast
                            isContainerBordered
                            isLastRow={index === parsedSocialLinks.length - 1}
                          >
                            <Link
                              href={normalizeUrl(link.url)}
                              target="_blank"
                              rel="noreferrer"
                              className="underline"
                            >
                              {normalizeUrl(link.url)}
                            </Link>
                          </TableCell>
                        </TableRow>
                      ),
                    )}
                  </tbody>
                </table>
              </TableContainer>
            </div>
          );
        }

        if (isExpandable) {
          return (
            <div className="w-full">
              <button
                onClick={(e) => {
                  if (isTableCell) {
                    e.stopPropagation();
                  }
                  onToggleExpanded?.();
                }}
                className={`group flex h-auto items-center gap-[5px] rounded border-none bg-transparent p-0 transition-colors ${isTableCell ? '' : 'hover:opacity-80'}`}
              >
                <TableIcon size={20} color="black" className="opacity-70" />
                <span className="font-sans text-[13px] font-semibold leading-[20px] text-black">
                  {isExpanded ? 'Close Table' : 'View Table'}
                </span>
              </button>
            </div>
          );
        }

        return (
          <>
            {parsedSocialLinks
              .map(
                (link: { platform: string; url: string }) =>
                  `${link.platform}: ${link.url}`,
              )
              .join(', ')}
          </>
        );
      }
      case 'websites': {
        const parsedWebsites = parseValue(value);

        if (!Array.isArray(parsedWebsites)) {
          return <>{parsedWebsites}</>;
        }

        if (isInExpandableRow) {
          return (
            <div className="w-full">
              <TableContainer bordered rounded background="white">
                <table className="w-full border-separate border-spacing-0">
                  <thead>
                    <tr className="bg-[#F5F5F5]">
                      <TableHeader width={214} isContainerBordered>
                        <div className="flex items-center gap-[5px]">
                          <span>Title</span>
                          <div className="flex size-[18px] items-center justify-center rounded bg-white opacity-40">
                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 18 18"
                              fill="none"
                            >
                              <circle
                                cx="9"
                                cy="9"
                                r="6.75"
                                stroke="black"
                                strokeWidth="1"
                              />
                              <circle
                                cx="9"
                                cy="6.75"
                                r="2.25"
                                stroke="black"
                                strokeWidth="1"
                              />
                              <path
                                d="M9 12.09L9 12.09"
                                stroke="black"
                                strokeWidth="1"
                                strokeLinecap="round"
                              />
                            </svg>
                          </div>
                        </div>
                      </TableHeader>
                      <TableHeader isLast isContainerBordered>
                        <div className="flex items-center gap-[5px]">
                          <span>URL</span>
                          <div className="flex size-[18px] items-center justify-center rounded bg-white opacity-40">
                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 18 18"
                              fill="none"
                            >
                              <circle
                                cx="9"
                                cy="9"
                                r="6.75"
                                stroke="black"
                                strokeWidth="1"
                              />
                              <circle
                                cx="9"
                                cy="6.75"
                                r="2.25"
                                stroke="black"
                                strokeWidth="1"
                              />
                              <path
                                d="M9 12.09L9 12.09"
                                stroke="black"
                                strokeWidth="1"
                                strokeLinecap="round"
                              />
                            </svg>
                          </div>
                        </div>
                      </TableHeader>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedWebsites.map(
                      (
                        website: { title: string; url: string },
                        index: number,
                      ) => (
                        <TableRow
                          key={index}
                          isLastRow={index === parsedWebsites.length - 1}
                        >
                          <TableCell
                            width={214}
                            isContainerBordered
                            isLastRow={index === parsedWebsites.length - 1}
                          >
                            {website.title}
                          </TableCell>
                          <TableCell
                            isLast
                            isContainerBordered
                            isLastRow={index === parsedWebsites.length - 1}
                          >
                            <Link
                              href={normalizeUrl(website.url)}
                              target="_blank"
                              rel="noreferrer"
                              className="underline"
                            >
                              {normalizeUrl(website.url)}
                            </Link>
                          </TableCell>
                        </TableRow>
                      ),
                    )}
                  </tbody>
                </table>
              </TableContainer>
            </div>
          );
        }

        if (isExpandable) {
          return (
            <div className="w-full">
              <button
                onClick={(e) => {
                  if (isTableCell) {
                    e.stopPropagation();
                  }
                  onToggleExpanded?.();
                }}
                className={`group flex h-auto items-center gap-[5px] rounded border-none bg-transparent p-0 transition-colors ${isTableCell ? '' : 'hover:opacity-80'}`}
              >
                <TableIcon size={20} color="black" className="opacity-70" />
                <span className="font-sans text-[13px] font-semibold leading-[20px] text-black">
                  {isExpanded ? 'Close Table' : 'View Table'}
                </span>
              </button>
            </div>
          );
        }

        return (
          <>
            {parsedWebsites
              .map(
                (website: { title: string; url: string }) =>
                  `${website.title}: ${normalizeUrl(website.url)}`,
              )
              .join(', ')}
          </>
        );
      }
      case 'tablePhysicalEntity': {
        const parsed = parseValue(value);

        if (!Array.isArray(parsed)) {
          return <>{parsed}</>;
        }

        if (isInExpandableRow) {
          return (
            <div className="w-full">
              <TableContainer bordered rounded background="white">
                <table className="w-full border-separate border-spacing-0">
                  <thead>
                    <tr className="bg-[#F5F5F5]">
                      <TableHeader width={214} isContainerBordered>
                        <div className="flex items-center gap-[5px]">
                          <span>Legal Name</span>
                        </div>
                      </TableHeader>
                      <TableHeader isLast isContainerBordered>
                        <div className="flex items-center gap-[5px]">
                          <span>Country/Region</span>
                          <Tooltip
                            content={
                              <div className="flex flex-col gap-1">
                                <span>
                                  Following{' '}
                                  <a
                                    href="https://www.iso.org/iso-3166-country-codes.html"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600"
                                  >
                                    {` ISO 3166 `}
                                  </a>
                                  standard
                                </span>
                              </div>
                            }
                            classNames={{
                              content:
                                'p-[10px] rounded-[5px] border border-black/10',
                            }}
                            closeDelay={0}
                          >
                            <div className="flex size-[18px] items-center justify-center rounded bg-white opacity-40">
                              <svg
                                width="18"
                                height="18"
                                viewBox="0 0 18 18"
                                fill="none"
                              >
                                <circle
                                  cx="9"
                                  cy="9"
                                  r="6.75"
                                  stroke="black"
                                  strokeWidth="1"
                                />
                                <circle
                                  cx="9"
                                  cy="6.75"
                                  r="2.25"
                                  stroke="black"
                                  strokeWidth="1"
                                />
                                <path
                                  d="M9 12.09L9 12.09"
                                  stroke="black"
                                  strokeWidth="1"
                                  strokeLinecap="round"
                                />
                              </svg>
                            </div>
                          </Tooltip>
                        </div>
                      </TableHeader>
                    </tr>
                  </thead>
                  <tbody>
                    {parsed.map((item: IPhysicalEntity, index: number) => (
                      <TableRow
                        key={index}
                        isLastRow={index === parsed.length - 1}
                      >
                        <TableCell
                          width={214}
                          isContainerBordered
                          isLastRow={index === parsed.length - 1}
                        >
                          {item.legalName}
                        </TableCell>
                        <TableCell
                          isLast
                          isContainerBordered
                          isLastRow={index === parsed.length - 1}
                        >
                          {getRegionLabel(item.country)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </tbody>
                </table>
              </TableContainer>
            </div>
          );
        }

        // 如果是可展开的，在普通单元格中只显示按钮
        if (isExpandable) {
          return (
            <div className="w-full">
              <button
                onClick={(e) => {
                  if (isTableCell) {
                    e.stopPropagation();
                  }
                  onToggleExpanded?.();
                }}
                className={`group flex h-auto items-center gap-[5px] rounded border-none bg-transparent p-0 transition-colors ${isTableCell ? '' : 'hover:opacity-80'}`}
              >
                <TableIcon size={20} color="black" className="opacity-70" />
                <span className="font-sans text-[13px] font-semibold leading-[20px] text-black">
                  {isExpanded ? 'Close Table' : 'View Table'}
                </span>
              </button>
            </div>
          );
        }

        // 非可展开状态下的默认显示（简单文本格式）
        return (
          <>
            {parsed
              .map(
                (item: IPhysicalEntity) =>
                  `${item.legalName}: ${getRegionLabel(item.country)}`,
              )
              .join(', ')}
          </>
        );
      }
      case 'fundingReceivedGrants': {
        const parsed = parseValue(value);

        if (!Array.isArray(parsed)) {
          return <>{parsed}</>;
        }

        if (isInExpandableRow) {
          return (
            <div className="w-full ">
              <TableContainer bordered rounded background="white">
                <table className="w-full border-separate border-spacing-0">
                  <thead>
                    <tr className="bg-[#F5F5F5]">
                      <TableHeader width={158} isContainerBordered>
                        <div className="flex items-center gap-[5px]">
                          <span>Date</span>
                          <TooltipWithQuestionIcon content="The Date of when this grant was given to this project" />
                        </div>
                      </TableHeader>
                      <TableHeader width={300} isContainerBordered>
                        <div className="flex items-center gap-[5px]">
                          <span>Organization/Program</span>
                          <TooltipWithQuestionIcon content="This refers to the organization or program this project has received their grants from" />
                        </div>
                      </TableHeader>
                      <TableHeader width={300} isContainerBordered>
                        <div className="flex items-center gap-[5px]">
                          <span>Project Donator</span>
                          <TooltipWithQuestionIcon content="Projects that have donated to this funding round or acted as sponsors" />
                        </div>
                      </TableHeader>
                      <TableHeader width={160} isContainerBordered>
                        <div className="flex items-center gap-[5px]">
                          <span>Amount (USD)</span>
                          <TooltipWithQuestionIcon content="This is the amount received at the time of this grant was given" />
                        </div>
                      </TableHeader>
                      <TableHeader width={200} isContainerBordered>
                        <div className="flex items-center gap-[5px]">
                          <span>Expense Sheet</span>
                          <TooltipWithQuestionIcon content="Link to detailed expense breakdown showing how the grant funds were utilized" />
                        </div>
                      </TableHeader>
                      <TableHeader isLast isContainerBordered>
                        <div className="flex items-center gap-[5px]">
                          <span>Reference</span>
                          <TooltipWithQuestionIcon content="This is the reference link that acts as  evidence for this entry" />
                        </div>
                      </TableHeader>
                    </tr>
                  </thead>
                  <tbody>
                    {parsed.map(
                      (
                        grant: {
                          date: Date | string;
                          organization: string | string[];
                          projectDonator?: string[];
                          amount: string;
                          reference: string;
                          expenseSheetUrl?: string;
                        },
                        index: number,
                      ) => (
                        <TableRow
                          key={index}
                          isLastRow={index === parsed.length - 1}
                        >
                          <TableCell
                            width={158}
                            isContainerBordered
                            isLastRow={index === parsed.length - 1}
                          >
                            {dayjs.utc(grant.date).format('YYYY-MM-DD')}
                          </TableCell>
                          <TableCell
                            width={301}
                            isContainerBordered
                            isLastRow={index === parsed.length - 1}
                          >
                            <ProjectFieldRenderer
                              projectValue={grant.organization}
                              projectsMap={projectsMap}
                              isLoadingProjects={isLoadingProjects}
                            />
                          </TableCell>
                          <TableCell
                            width={300}
                            isContainerBordered
                            isLastRow={index === parsed.length - 1}
                          >
                            <ProjectFieldRenderer
                              projectValue={grant.projectDonator}
                              projectsMap={projectsMap}
                              isLoadingProjects={isLoadingProjects}
                            />
                          </TableCell>
                          <TableCell
                            width={138}
                            isContainerBordered
                            isLastRow={index === parsed.length - 1}
                          >
                            {formatAmount(grant.amount)}
                          </TableCell>
                          <TableCell
                            width={200}
                            isContainerBordered
                            isLastRow={index === parsed.length - 1}
                          >
                            {grant.expenseSheetUrl ? (
                              <Link
                                href={normalizeUrl(grant.expenseSheetUrl)}
                                target="_blank"
                                rel="noreferrer"
                                className="underline"
                              >
                                {normalizeUrl(grant.expenseSheetUrl)}
                              </Link>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </TableCell>
                          <TableCell
                            isLast
                            isContainerBordered
                            isLastRow={index === parsed.length - 1}
                          >
                            {grant.reference ? (
                              <Link
                                href={normalizeUrl(grant.reference)}
                                target="_blank"
                                rel="noreferrer"
                                className="underline"
                              >
                                {normalizeUrl(grant.reference)}
                              </Link>
                            ) : (
                              '-'
                            )}
                          </TableCell>
                        </TableRow>
                      ),
                    )}
                  </tbody>
                </table>
              </TableContainer>
            </div>
          );
        }

        if (isExpandable) {
          return (
            <div className="w-full">
              <button
                onClick={(e) => {
                  if (isTableCell) {
                    e.stopPropagation();
                  }
                  onToggleExpanded?.();
                }}
                className={`group flex h-auto items-center gap-[5px] rounded border-none bg-transparent p-0 transition-colors ${isTableCell ? '' : 'hover:opacity-80'}`}
              >
                <TableIcon size={20} color="black" className="opacity-70" />
                <span className="font-sans text-[13px] font-semibold leading-[20px] text-black">
                  {isExpanded ? 'Close Table' : 'View Table'}
                </span>
              </button>
            </div>
          );
        }

        return (
          <>
            {parsed
              .map(
                (grant: {
                  date: Date | string;
                  organization: string;
                  amount: string;
                  reference: string;
                  expenseSheetUrl?: string;
                }) => {
                  const dateStr = dayjs.utc(grant.date).format('YYYY-MM-DD');
                  return `${dateStr}: ${grant.organization} - ${formatAmount(grant.amount)} - ${grant.expenseSheetUrl ? `${grant.expenseSheetUrl} -` : ''}${grant.reference}`;
                },
              )
              .join(', ')}
          </>
        );
      }
      case 'affiliated_projects': {
        const parsed = parseValue(value);

        if (!Array.isArray(parsed)) {
          return <>{parsed}</>;
        }

        if (isInExpandableRow) {
          return (
            <div className="w-full ">
              <TableContainer bordered rounded background="white">
                <table className="w-full border-separate border-spacing-0">
                  <thead>
                    <tr className="bg-[#F5F5F5]">
                      <TableHeader width={300} isContainerBordered>
                        <div className="flex items-center gap-[5px]">
                          <span>Project</span>
                          <TooltipWithQuestionIcon content="The project that has an affiliation with this project" />
                        </div>
                      </TableHeader>
                      <TableHeader width={180} isContainerBordered>
                        <div className="flex items-center gap-[5px]">
                          <span>Affiliation Type</span>
                          <TooltipWithQuestionIcon content="The type of relationship between the projects" />
                        </div>
                      </TableHeader>
                      <TableHeader width={250} isContainerBordered>
                        <div className="flex items-center gap-[5px]">
                          <span>Description</span>
                          <TooltipWithQuestionIcon content="Description of the affiliation relationship" />
                        </div>
                      </TableHeader>
                      <TableHeader isLast isContainerBordered>
                        <div className="flex items-center gap-[5px]">
                          <span>Reference</span>
                          <TooltipWithQuestionIcon content="Reference link for more information about this affiliation" />
                        </div>
                      </TableHeader>
                    </tr>
                  </thead>
                  <tbody>
                    {parsed.map(
                      (
                        item: {
                          project: string | string[];
                          affiliationType: string;
                          description: string;
                          reference?: string;
                        },
                        index: number,
                      ) => (
                        <TableRow
                          key={index}
                          isLastRow={index === parsed.length - 1}
                        >
                          <TableCell
                            width={300}
                            isContainerBordered
                            isLastRow={index === parsed.length - 1}
                          >
                            <ProjectFieldRenderer
                              projectValue={item.project}
                              projectsMap={projectsMap}
                              isLoadingProjects={isLoadingProjects}
                            />
                          </TableCell>
                          <TableCell
                            width={180}
                            isContainerBordered
                            isLastRow={index === parsed.length - 1}
                          >
                            {getOptionLabel(
                              item.affiliationType,
                              AFFILIATION_TYPE_OPTIONS,
                            )}
                          </TableCell>
                          <TableCell
                            width={250}
                            isContainerBordered
                            isLastRow={index === parsed.length - 1}
                          >
                            {item.description || '-'}
                          </TableCell>
                          <TableCell
                            isLast
                            isContainerBordered
                            isLastRow={index === parsed.length - 1}
                          >
                            {item.reference ? (
                              <Link
                                href={normalizeUrl(item.reference)}
                                target="_blank"
                                rel="noreferrer"
                                className="underline"
                              >
                                {normalizeUrl(item.reference)}
                              </Link>
                            ) : (
                              '-'
                            )}
                          </TableCell>
                        </TableRow>
                      ),
                    )}
                  </tbody>
                </table>
              </TableContainer>
            </div>
          );
        }

        if (isExpandable) {
          return (
            <div className="w-full">
              <button
                onClick={(e) => {
                  if (isTableCell) {
                    e.stopPropagation();
                  }
                  onToggleExpanded?.();
                }}
                className={`group flex h-auto items-center gap-[5px] rounded border-none bg-transparent p-0 transition-colors ${isTableCell ? '' : 'hover:opacity-80'}`}
              >
                <TableIcon size={20} color="black" className="opacity-70" />
                <span className="font-sans text-[13px] font-semibold leading-[20px] text-black">
                  {isExpanded ? 'Close Table' : 'View Table'}
                </span>
              </button>
            </div>
          );
        }

        return (
          <>
            {parsed
              .map(
                (item: {
                  project: string | string[];
                  affiliationType: string;
                  description: string;
                  reference?: string;
                }) => {
                  const projectName = Array.isArray(item.project)
                    ? item.project.join(', ')
                    : item.project;
                  const typeLabel = getOptionLabel(
                    item.affiliationType,
                    AFFILIATION_TYPE_OPTIONS,
                  );
                  return `${projectName} - ${typeLabel}: ${item.description}${item.reference ? ` - ${item.reference}` : ''}`;
                },
              )
              .join(', ')}
          </>
        );
      }
      case 'contributing_teams': {
        const parsed = parseValue(value);

        if (!Array.isArray(parsed)) {
          return <>{parsed}</>;
        }

        if (isInExpandableRow) {
          return (
            <div className="w-full ">
              <TableContainer bordered rounded background="white">
                <table className="w-full border-separate border-spacing-0">
                  <thead>
                    <tr className="bg-[#F5F5F5]">
                      <TableHeader width={300} isContainerBordered>
                        <div className="flex items-center gap-[5px]">
                          <span>Project</span>
                          <TooltipWithQuestionIcon content="The team or organization that contributed to this project" />
                        </div>
                      </TableHeader>
                      <TableHeader width={200} isContainerBordered>
                        <div className="flex items-center gap-[5px]">
                          <span>Area of Contribution</span>
                          <TooltipWithQuestionIcon content="The type of contribution provided" />
                        </div>
                      </TableHeader>
                      <TableHeader width={250} isContainerBordered>
                        <div className="flex items-center gap-[5px]">
                          <span>Description</span>
                          <TooltipWithQuestionIcon content="Description of the contribution" />
                        </div>
                      </TableHeader>
                      <TableHeader isLast isContainerBordered>
                        <div className="flex items-center gap-[5px]">
                          <span>Reference</span>
                          <TooltipWithQuestionIcon content="Reference link for more information about this contribution" />
                        </div>
                      </TableHeader>
                    </tr>
                  </thead>
                  <tbody>
                    {parsed.map(
                      (
                        item: {
                          project: string | string[];
                          type: string;
                          description?: string;
                          reference?: string;
                        },
                        index: number,
                      ) => (
                        <TableRow
                          key={index}
                          isLastRow={index === parsed.length - 1}
                        >
                          <TableCell
                            width={300}
                            isContainerBordered
                            isLastRow={index === parsed.length - 1}
                          >
                            <ProjectFieldRenderer
                              projectValue={item.project}
                              projectsMap={projectsMap}
                              isLoadingProjects={isLoadingProjects}
                            />
                          </TableCell>
                          <TableCell
                            width={200}
                            isContainerBordered
                            isLastRow={index === parsed.length - 1}
                          >
                            {getOptionLabel(
                              item.type,
                              CONTRIBUTION_TYPE_OPTIONS,
                            )}
                          </TableCell>
                          <TableCell
                            width={250}
                            isContainerBordered
                            isLastRow={index === parsed.length - 1}
                          >
                            {item.description || '-'}
                          </TableCell>
                          <TableCell
                            isLast
                            isContainerBordered
                            isLastRow={index === parsed.length - 1}
                          >
                            {item.reference ? (
                              <Link
                                href={normalizeUrl(item.reference)}
                                target="_blank"
                                rel="noreferrer"
                                className="underline"
                              >
                                {normalizeUrl(item.reference)}
                              </Link>
                            ) : (
                              '-'
                            )}
                          </TableCell>
                        </TableRow>
                      ),
                    )}
                  </tbody>
                </table>
              </TableContainer>
            </div>
          );
        }

        if (isExpandable) {
          return (
            <div className="w-full">
              <button
                onClick={(e) => {
                  if (isTableCell) {
                    e.stopPropagation();
                  }
                  onToggleExpanded?.();
                }}
                className={`group flex h-auto items-center gap-[5px] rounded border-none bg-transparent p-0 transition-colors ${isTableCell ? '' : 'hover:opacity-80'}`}
              >
                <TableIcon size={20} color="black" className="opacity-70" />
                <span className="font-sans text-[13px] font-semibold leading-[20px] text-black">
                  {isExpanded ? 'Close Table' : 'View Table'}
                </span>
              </button>
            </div>
          );
        }

        return (
          <>
            {parsed
              .map(
                (item: {
                  project: string | string[];
                  type: string;
                  description?: string;
                  reference?: string;
                }) => {
                  const projectName = Array.isArray(item.project)
                    ? item.project.join(', ')
                    : item.project;
                  const typeLabel = getOptionLabel(
                    item.type,
                    CONTRIBUTION_TYPE_OPTIONS,
                  );
                  return `${projectName} - ${typeLabel}: ${item.description || 'N/A'}${item.reference ? ` - ${item.reference}` : ''}`;
                },
              )
              .join(', ')}
          </>
        );
      }
      case 'stack_integrations': {
        const parsed = parseValue(value);

        if (!Array.isArray(parsed)) {
          return <>{parsed}</>;
        }

        if (isInExpandableRow) {
          return (
            <div className="w-full ">
              <TableContainer bordered rounded background="white">
                <table className="w-full border-separate border-spacing-0">
                  <thead>
                    <tr className="bg-[#F5F5F5]">
                      <TableHeader width={240} isContainerBordered>
                        <div className="flex items-center gap-[5px]">
                          <span>Project</span>
                          <TooltipWithQuestionIcon content="The project or technology integrated with this project" />
                        </div>
                      </TableHeader>
                      <TableHeader width={180} isContainerBordered>
                        <div className="flex items-center gap-[5px]">
                          <span>Type</span>
                          <TooltipWithQuestionIcon content="The type of integration or dependency" />
                        </div>
                      </TableHeader>
                      <TableHeader width={200} isContainerBordered>
                        <div className="flex items-center gap-[5px]">
                          <span>Description</span>
                          <TooltipWithQuestionIcon content="Description of the integration" />
                        </div>
                      </TableHeader>
                      <TableHeader width={180} isContainerBordered>
                        <div className="flex items-center gap-[5px]">
                          <span>Reference</span>
                          <TooltipWithQuestionIcon content="Reference link for more information" />
                        </div>
                      </TableHeader>
                      <TableHeader isLast isContainerBordered>
                        <div className="flex items-center gap-[5px]">
                          <span>Repository</span>
                          <TooltipWithQuestionIcon content="Repository link for the integration" />
                        </div>
                      </TableHeader>
                    </tr>
                  </thead>
                  <tbody>
                    {parsed.map(
                      (
                        item: {
                          project: string | string[];
                          type: string;
                          description?: string;
                          reference?: string;
                          repository?: string;
                        },
                        index: number,
                      ) => (
                        <TableRow
                          key={index}
                          isLastRow={index === parsed.length - 1}
                        >
                          <TableCell
                            width={240}
                            isContainerBordered
                            isLastRow={index === parsed.length - 1}
                          >
                            <ProjectFieldRenderer
                              projectValue={item.project}
                              projectsMap={projectsMap}
                              isLoadingProjects={isLoadingProjects}
                            />
                          </TableCell>
                          <TableCell
                            width={180}
                            isContainerBordered
                            isLastRow={index === parsed.length - 1}
                          >
                            {getOptionLabel(
                              item.type,
                              STACK_INTEGRATION_TYPE_OPTIONS,
                            )}
                          </TableCell>
                          <TableCell
                            width={200}
                            isContainerBordered
                            isLastRow={index === parsed.length - 1}
                          >
                            {item.description || '-'}
                          </TableCell>
                          <TableCell
                            width={180}
                            isContainerBordered
                            isLastRow={index === parsed.length - 1}
                          >
                            {item.reference ? (
                              <Link
                                href={normalizeUrl(item.reference)}
                                target="_blank"
                                rel="noreferrer"
                                className="underline"
                              >
                                {normalizeUrl(item.reference)}
                              </Link>
                            ) : (
                              '-'
                            )}
                          </TableCell>
                          <TableCell
                            isLast
                            isContainerBordered
                            isLastRow={index === parsed.length - 1}
                          >
                            {item.repository ? (
                              <Link
                                href={normalizeUrl(item.repository)}
                                target="_blank"
                                rel="noreferrer"
                                className="underline"
                              >
                                {normalizeUrl(item.repository)}
                              </Link>
                            ) : (
                              '-'
                            )}
                          </TableCell>
                        </TableRow>
                      ),
                    )}
                  </tbody>
                </table>
              </TableContainer>
            </div>
          );
        }

        if (isExpandable) {
          return (
            <div className="w-full">
              <button
                onClick={(e) => {
                  if (isTableCell) {
                    e.stopPropagation();
                  }
                  onToggleExpanded?.();
                }}
                className={`group flex h-auto items-center gap-[5px] rounded border-none bg-transparent p-0 transition-colors ${isTableCell ? '' : 'hover:opacity-80'}`}
              >
                <TableIcon size={20} color="black" className="opacity-70" />
                <span className="font-sans text-[13px] font-semibold leading-[20px] text-black">
                  {isExpanded ? 'Close Table' : 'View Table'}
                </span>
              </button>
            </div>
          );
        }

        return (
          <>
            {parsed
              .map(
                (item: {
                  project: string | string[];
                  type: string;
                  description?: string;
                  reference?: string;
                  repository?: string;
                }) => {
                  const projectName = Array.isArray(item.project)
                    ? item.project.join(', ')
                    : item.project;
                  const typeLabel = getOptionLabel(
                    item.type,
                    STACK_INTEGRATION_TYPE_OPTIONS,
                  );
                  return `${projectName} - ${typeLabel}: ${item.description || 'N/A'}${item.reference ? ` - ${item.reference}` : ''}${item.repository ? ` - ${item.repository}` : ''}`;
                },
              )
              .join(', ')}
          </>
        );
      }
      default:
        return <>{value}</>;
    }
  }, [
    displayFormType,
    formatValue,
    value,
    isExpandable,
    isExpanded,
    onToggleExpanded,
    isInExpandableRow,
    isLoadingProjects,
    projectsMap,
    isTableCell,
  ]);

  if (!displayFormType) {
    if (Array.isArray(value)) {
      return <>{JSON.stringify(value)}</>;
    }
    return <>{value}</>;
  }

  const isValueEmpty = isInputValueEmpty(value);

  if (isValueEmpty || isInputValueNA(value)) {
    return !isEssential ? (
      <span className="font-sans text-[14px] font-semibold">{`---`}</span>
    ) : (
      <span>n/a</span>
    );
  }

  if (isExpandable && !isEmbedTableFormType(displayFormType)) {
    // If we're in an expandable row, show full content without line clamp
    if (isInExpandableRow) {
      return (
        <div
          className="overflow-hidden break-all"
          style={{
            wordBreak: 'break-all',
            overflowWrap: 'anywhere',
          }}
        >
          {renderContent()}
        </div>
      );
    }

    // Otherwise, show truncated content with line clamp
    return (
      <div
        className="cursor-pointer overflow-hidden break-all"
        style={{
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          wordBreak: 'break-all',
          overflowWrap: 'anywhere',
        }}
        onClick={(e) => {
          if (isTableCell) {
            e.stopPropagation();
          }
          onToggleExpanded?.();
        }}
      >
        {renderContent()}
      </div>
    );
  }

  return <>{renderContent()}</>;
};

export default memo(InputContentRenderer);
