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
  // 首先尝试解析JSON字符串，获取真实的数据类型
  let actualValue = value;
  if (typeof value === 'string' && value.trim()) {
    try {
      actualValue = JSON.parse(value);
    } catch {
      // JSON.parse失败，使用原始值
      actualValue = value;
    }
  }

  // 检查基础的空值情况
  if (
    !actualValue ||
    (typeof actualValue === 'string' && actualValue?.toLowerCase() === 'n/a')
  ) {
    return true;
  }

  // 检查数组类型且为空数组
  if (Array.isArray(actualValue) && actualValue.length === 0) {
    return true;
  }

  return false;
};

// 解析多值数据的公共方法
export const parseMultipleValue = (value: any): string[] => {
  // 如果已经是数组，直接返回
  if (Array.isArray(value)) {
    return value;
  }

  // 尝试解析JSON字符串
  if (typeof value === 'string' && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch {
      // JSON.parse失败，按逗号分隔处理
    }

    // 按逗号分隔字符串处理
    return value.split(',').map((item: string) => item.trim());
  }

  // 其他情况返回原值的数组形式
  return [value];
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
      case 'founderList':
        return (
          <>
            {Array.isArray(value)
              ? value
                  .map((founder: any) => `${founder.name}-${founder.title}`)
                  .join(', ')
              : value}
          </>
        );
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

  // 如果可展开且已展开，显示Close按钮
  if (isExpandable && isRowExpanded) {
    return <span>Close</span>;
  }

  if (isExpandable && !isRowExpanded) {
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

  // 普通情况直接返回内容
  return <>{renderContent()}</>;
};

export default memo(InputContentRenderer);
