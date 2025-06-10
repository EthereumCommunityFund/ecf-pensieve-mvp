import dayjs from 'dayjs';
import Image from 'next/image';
import Link from 'next/link';
import React, { memo, useCallback } from 'react';

import { IFormDisplayType, IPocItemKey } from '@/types/item';
import {
  isInputValueEmpty,
  isInputValueNA,
  parseMultipleValue,
  parseValue,
} from '@/utils/item';
import { normalizeUrl } from '@/utils/url';

interface IProps {
  itemKey: IPocItemKey;
  isEssential: boolean;
  value: any;
  displayFormType?: IFormDisplayType;
  isExpandable?: boolean;
  onToggleExpanded?: () => void;
}

const InputContentRenderer: React.FC<IProps> = ({
  value,
  itemKey,
  isEssential,
  displayFormType,
  isExpandable,
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
      // TODO, founderList的展示UI需要调整，目前是展示name-title，需要展示类似表格的形式
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
      case 'websites': {
        const parsedWebsites = parseValue(value);
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
  }, [displayFormType, formatValue, value]);

  if (!displayFormType) {
    if (Array.isArray(value)) {
      return <>{JSON.stringify(value)}</>;
    }
    return <>{value}</>;
  }

  const isValueEmpty = isInputValueEmpty(value);

  // TODO 确认NA的判断
  if (isValueEmpty || isInputValueNA(value)) {
    return !isEssential ? (
      <span className="font-mona text-[14px] font-[600]">{`---`}</span>
    ) : (
      <span>n/a</span>
    );
  }

  if (isExpandable) {
    return (
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
