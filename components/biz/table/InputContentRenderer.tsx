import { Skeleton, Tooltip } from '@heroui/react';
import dayjs from 'dayjs';
import Image from 'next/image';
import Link from 'next/link';
import React, { memo, useCallback, useMemo } from 'react';

import { TableIcon } from '@/components/icons';
import { SelectedProjectTag } from '@/components/pages/project/create/form/ProjectSearchSelector';
import TooltipWithQuestionIcon from '@/components/pages/project/create/form/TooltipWithQuestionIcon';
import { useProjectNamesByIds } from '@/hooks/useProjectsByIds';
import { IProject } from '@/types';
import { IFormDisplayType, IPhysicalEntity, IPocItemKey } from '@/types/item';
import {
  isInputValueEmpty,
  isInputValueNA,
  parseMultipleValue,
  parseValue,
} from '@/utils/item';
import { getRegionLabel } from '@/utils/region';
import { normalizeUrl } from '@/utils/url';

import { TableCell, TableContainer, TableHeader, TableRow } from './index';

interface IProps {
  itemKey: IPocItemKey;
  isEssential: boolean;
  value: any;
  displayFormType?: IFormDisplayType;
  isExpandable?: boolean;
  isExpanded?: boolean;
  onToggleExpanded?: () => void;
  isInExpandableRow?: boolean;
}

const InputContentRenderer: React.FC<IProps> = ({
  value,
  isEssential,
  displayFormType,
  isExpandable,
  isExpanded,
  onToggleExpanded,
  isInExpandableRow,
}) => {
  const formatValue =
    typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value;

  // For fundingReceivedGrants, extract project IDs from organization and projectDonator fields
  const grantProjectIds = useMemo(() => {
    if (displayFormType !== 'fundingReceivedGrants') return [];

    const parsed = parseValue(formatValue);
    if (!parsed || !Array.isArray(parsed)) return [];

    const ids: string[] = [];
    parsed.forEach((grant: any) => {
      // Extract from organization field
      if (grant.organization) {
        if (Array.isArray(grant.organization)) {
          // New format: array of project IDs
          ids.push(...grant.organization);
        }
      }
      // Extract from projectDonator field
      if (grant.projectDonator && Array.isArray(grant.projectDonator)) {
        ids.push(...grant.projectDonator);
      }
    });

    return [...new Set(ids)]; // Remove duplicates
  }, [displayFormType, formatValue]);

  // Fetch project names for grant organizations
  const { projectsMap, isLoading: isLoadingProjects } = useProjectNamesByIds(
    grantProjectIds,
    {
      enabled:
        displayFormType === 'fundingReceivedGrants' &&
        grantProjectIds.length > 0,
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
            href={value}
            target="_blank"
            rel="noreferrer"
            className="break-all underline"
            style={{
              wordBreak: 'break-all',
              overflowWrap: 'anywhere',
            }}
          >
            {value}
          </Link>
        );
      case 'date':
        return <>{dayjs(value).format('MMM, DD, YYYY')}</>;
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
                onClick={onToggleExpanded}
                className="group flex h-auto items-center gap-[5px] rounded border-none bg-transparent p-0 transition-colors"
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
                onClick={onToggleExpanded}
                className="group flex h-auto items-center gap-[5px] rounded border-none bg-transparent p-0 transition-colors"
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
                onClick={onToggleExpanded}
                className="group flex h-auto items-center gap-[5px] rounded border-none bg-transparent p-0 transition-colors"
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
                          <span className="shrink-0">Amount (USD)</span>
                          <TooltipWithQuestionIcon content="This is the amount received at the time of this grant was given" />
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
                            {dayjs(grant.date).format('YYYY/MM/DD')}
                          </TableCell>
                          <TableCell
                            width={301}
                            isContainerBordered
                            isLastRow={index === parsed.length - 1}
                          >
                            {(() => {
                              if (!grant.organization) return '';

                              // Check if it's the old format (string)
                              if (typeof grant.organization === 'string') {
                                return grant.organization;
                              }

                              // New format: array of project IDs
                              if (Array.isArray(grant.organization)) {
                                if (isLoadingProjects) {
                                  return (
                                    <Skeleton className="h-[20px] w-[50px] rounded-sm" />
                                  );
                                }

                                const projects = (
                                  grant.organization as string[]
                                )
                                  .map((id: string) => {
                                    const numId = parseInt(id, 10);
                                    const projectData = projectsMap?.get(numId);
                                    return projectData || null;
                                  })
                                  .filter((p): p is IProject => p !== null);

                                return (
                                  <div className="flex flex-wrap items-center gap-[8px]">
                                    {projects.map((project) => (
                                      <SelectedProjectTag
                                        key={project.id}
                                        project={project}
                                      />
                                    ))}
                                  </div>
                                );
                              }

                              return '';
                            })()}
                          </TableCell>
                          <TableCell
                            width={300}
                            isContainerBordered
                            isLastRow={index === parsed.length - 1}
                          >
                            {(() => {
                              // Compatibility: handle old data without projectDonator field
                              if (
                                !grant.projectDonator ||
                                !Array.isArray(grant.projectDonator) ||
                                grant.projectDonator.length === 0
                              ) {
                                return '-';
                              }

                              if (isLoadingProjects) {
                                return (
                                  <Skeleton className="h-[20px] w-[50px] rounded-sm" />
                                );
                              }

                              const donatorProjects = grant.projectDonator
                                .map((id: string) => {
                                  const numId = parseInt(id, 10);
                                  const projectData = projectsMap?.get(numId);
                                  return projectData || null;
                                })
                                .filter((p): p is IProject => p !== null);

                              return donatorProjects.length > 0 ? (
                                <div className="flex flex-wrap items-center gap-[8px]">
                                  {donatorProjects.map((project) => (
                                    <SelectedProjectTag
                                      key={project.id}
                                      project={project}
                                    />
                                  ))}
                                </div>
                              ) : (
                                '-'
                              );
                            })()}
                          </TableCell>
                          <TableCell
                            width={138}
                            isContainerBordered
                            isLastRow={index === parsed.length - 1}
                          >
                            {grant.amount}
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
                onClick={onToggleExpanded}
                className="group flex h-auto items-center gap-[5px] rounded border-none bg-transparent p-0 transition-colors"
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
                }) => {
                  const dateStr = dayjs(grant.date).format('YYYY/MM/DD');
                  return `${dateStr}: ${grant.organization} - ${grant.amount} - ${grant.reference}`;
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

  if (
    isExpandable &&
    displayFormType !== 'founderList' &&
    displayFormType !== 'websites' &&
    displayFormType !== 'tablePhysicalEntity' &&
    displayFormType !== 'fundingReceivedGrants'
  ) {
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
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          wordBreak: 'break-all',
          overflowWrap: 'anywhere',
        }}
        onClick={onToggleExpanded}
      >
        {renderContent()}
      </div>
    );
  }

  return <>{renderContent()}</>;
};

export default memo(InputContentRenderer);
