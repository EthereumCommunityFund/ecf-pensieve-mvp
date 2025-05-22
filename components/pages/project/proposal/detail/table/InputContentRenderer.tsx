import dayjs from 'dayjs';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

import { IFormDisplayType } from '@/types/item';

interface IProps {
  value: any;
  displayFormType?: IFormDisplayType;
}

const InputContentRenderer: React.FC<IProps> = ({ value, displayFormType }) => {
  if (!displayFormType) {
    if (Array.isArray(value)) {
      return <>{JSON.stringify(value)}</>;
    }
    return <>{value}</>;
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
      return (
        <Image
          src={value}
          alt="img"
          width={40}
          height={40}
          className="size-[40px] rounded-[5px]"
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

export default InputContentRenderer;
