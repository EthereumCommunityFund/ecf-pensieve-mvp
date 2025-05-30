import dayjs from 'dayjs';
import Image from 'next/image';
import Link from 'next/link';
import React, { memo, useCallback } from 'react';

import { IFormDisplayType, IPocItemKey } from '@/types/item';

interface IProps {
  itemKey: IPocItemKey;
  isEssential: boolean;
  value: any;
  displayFormType?: IFormDisplayType;
  isExpandable?: boolean;
  isRowExpanded?: boolean;
  onToggleExpanded?: () => void;
}

export const isInputValueEmpty = (value: any) => {
  let actualValue = value;
  if (typeof value === 'string' && value.trim()) {
    try {
      actualValue = JSON.parse(value);
    } catch {
      actualValue = value;
    }
  }

  if (
    !actualValue ||
    (typeof actualValue === 'string' && actualValue?.toLowerCase() === 'n/a')
  ) {
    return true;
  }

  if (Array.isArray(actualValue) && actualValue.length === 0) {
    return true;
  }

  return false;
};

export const parseMultipleValue = (value: any): string[] => {
  const parsedValue = parseValue(value);

  if (Array.isArray(parsedValue)) {
    return parsedValue;
  }

  if (typeof parsedValue === 'string' && parsedValue.trim()) {
    return parsedValue.split(',').map((item: string) => item.trim());
  }

  return [parsedValue];
};

export const parseValue = (value: any) => {
  if (typeof value === 'object' && value !== null) {
    return value;
  }

  if (typeof value === 'string' && value.trim()) {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }

  return value;
};

const InputContentRenderer: React.FC<IProps> = ({
  value,
  itemKey,
  isEssential,
  displayFormType,
  isExpandable,
  isRowExpanded,
  onToggleExpanded,
}) => {
  const formatValue =
    typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value;

  const renderContent = useCallback(() => {
    switch (displayFormType) {
      case 'string':
      case 'select':
        return <>{formatValue}</>;
      case 'stringMultiple':
        return <>{parseMultipleValue(value).join(', ')}</>;
      case 'selectMultiple':
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
        return (
          <>
            {Array.isArray(parsedFounderList)
              ? parsedFounderList
                  .map((founder: any) => `${founder.name}-${founder.title}`)
                  .join(', ')
              : parsedFounderList}
          </>
        );
      }
      default:
        return <>{value}</>;
    }
  }, [displayFormType, formatValue, value]);

  if (!displayFormType) {
    if (Array.isArray(value)) {
      return <>{JSON.stringify(value)}</>;
    }
    return <>{value}</>;
  }

  const isValueEmpty = isInputValueEmpty(value);

  if (isValueEmpty) {
    return !isEssential ? (
      <span className="font-mona text-[14px] font-[600]">{`---`}</span>
    ) : (
      <span>n/a</span>
    );
  }

  if (isExpandable) {
    return isRowExpanded ? (
      <span>Close</span>
    ) : (
      <div
        className="cursor-pointer overflow-hidden"
        style={{
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
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
