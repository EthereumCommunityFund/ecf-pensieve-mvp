import dayjs from 'dayjs';
import Image from 'next/image';
import Link from 'next/link';
import React, { memo, useCallback } from 'react';

import { TableIcon } from '@/components/icons';
import { IFormDisplayType, IPocItemKey } from '@/types/item';
import {
  isInputValueEmpty,
  isInputValueNA,
  parseMultipleValue,
  parseValue,
} from '@/utils/item';
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
  itemKey,
  isEssential,
  displayFormType,
  isExpandable,
  isExpanded,
  onToggleExpanded,
  isInExpandableRow,
}) => {
  const formatValue =
    typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value;

  const renderContent = useCallback(() => {
    switch (displayFormType) {
      case 'string':
      case 'select':
        return <>{formatValue}</>;
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
            className="underline"
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

        // 如果在 ExpandableRow 中，只显示表格内容，不显示按钮
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
                          <span>Title/Role</span>
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
                    {parsedFounderList.map((founder: any, index: number) => (
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
                          isLast
                          isContainerBordered
                          isLastRow={index === parsedFounderList.length - 1}
                        >
                          {founder.title}
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
        break;
      }
      case 'websites': {
        const parsedWebsites = parseValue(value);

        if (!Array.isArray(parsedWebsites)) {
          return <>{parsedWebsites}</>;
        }

        // 如果在 ExpandableRow 中，只显示表格内容，不显示按钮
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
                    {parsedWebsites.map((website: any, index: number) => (
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
            {parsedWebsites
              .map(
                (website: any) =>
                  `${website.title}: ${normalizeUrl(website.url)}`,
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
    displayFormType !== 'websites'
  ) {
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
