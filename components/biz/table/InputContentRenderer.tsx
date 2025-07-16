import dayjs from 'dayjs';
import Image from 'next/image';
import Link from 'next/link';
import React, { memo, useCallback } from 'react';

import { TableIcon } from '@/components/icons';
import {
  founderColumns,
  physicalEntityColumns,
  websiteColumns,
} from '@/components/pages/project/create/form/tableConfigs';
import { IFormDisplayType, IPocItemKey } from '@/types/item';
import {
  isInputValueEmpty,
  isInputValueNA,
  parseMultipleValue,
  parseValue,
} from '@/utils/item';

import { GenericTableDisplay } from './GenericTableDisplay';

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

        if (isExpandable && !isExpanded) {
          return <>{joinedText}</>;
        }

        return <>{joinedText}</>;
      }
      case 'selectMultiple':
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

      case 'founderList':
      case 'websites':
      case 'tablePhysicalEntity': {
        const parsedData = parseValue(value);

        if (!Array.isArray(parsedData)) {
          return <>{parsedData}</>;
        }

        if (isInExpandableRow) {
          let columns;
          if (displayFormType === 'founderList') columns = founderColumns;
          else if (displayFormType === 'websites') columns = websiteColumns;
          else columns = physicalEntityColumns;

          return (
            <GenericTableDisplay data={parsedData} columns={columns as any} />
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

        // Default text format for non-expandable
        return (
          <>
            {parsedData
              .map((item: any) => Object.values(item).join(': '))
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
    displayFormType !== 'websites' &&
    displayFormType !== 'tablePhysicalEntity'
  ) {
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
