import dayjs from 'dayjs';
import Image from 'next/image';
import Link from 'next/link';
import React, { memo } from 'react';

import { IFormDisplayType, IPocItemKey } from '@/types/item';

interface IProps {
  itemKey: IPocItemKey;
  isEssential: boolean;
  value: any;
  displayFormType?: IFormDisplayType;
}

export const isInputValueEmpty = (value: any) => {
  // TODO 完善这个逻辑
  return (
    !value || (typeof value === 'string' && value?.toLowerCase() === 'n/a')
  );
};

const InputContentRenderer: React.FC<IProps> = ({
  value,
  itemKey,
  isEssential,
  displayFormType,
}) => {
  if (!displayFormType) {
    if (Array.isArray(value)) {
      return <>{JSON.stringify(value)}</>;
    }
    return <>{value}</>;
  }

  const isValueEmpty = isInputValueEmpty(value);

  if (!isEssential && isValueEmpty) {
    return <div className="font-mona text-[14px] font-[600]">{`---`}</div>;
  }

  const formatValue =
    typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value;

  switch (displayFormType) {
    case 'string':
    case 'select':
      return <>{formatValue}</>;
    case 'stringMultiple':
      return (
        <>
          {value
            .split(',')
            .map((item: string) => item.trim())
            .join(', ')}
        </>
      );
    case 'selectMultiple':
      return <>{Array.isArray(value) ? value.join(', ') : value}</>;
    case 'img':
      return !value || value.toLowerCase() === 'n/a' ? (
        <>n/a</>
      ) : (
        <Image
          src={value}
          alt="img"
          width={40}
          height={40}
          className="size-[40px] shrink-0 rounded-[5px] object-cover"
        />
      );
    case 'link':
      return !value || value.toLowerCase() === 'n/a' ? (
        <>n/a</>
      ) : (
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
};

export default memo(InputContentRenderer);
