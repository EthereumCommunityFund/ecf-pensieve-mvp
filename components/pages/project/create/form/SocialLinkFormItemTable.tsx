'use client';

import { XCircle } from '@phosphor-icons/react';
import React, { useCallback } from 'react';
import { FieldError, FieldErrorsImpl, Merge } from 'react-hook-form';

import { Select, SelectItem } from '@/components/base/select';
import { SOCIAL_PLATFORMS } from '@/constants/socialPlatforms';

import { ISocialLink } from '../types';

interface SocialLinkFormItemTableProps {
  index: number;
  remove: (index: number) => void;
  errors: Merge<FieldError, FieldErrorsImpl<ISocialLink>> | undefined;
  isPrimary: boolean;
  canRemove: boolean;
  touchedFields: any;
  isSubmitted?: boolean;
  value: ISocialLink;
  onChange: (value: ISocialLink) => void;
}

const SocialLinkFormItemTable: React.FC<SocialLinkFormItemTableProps> = ({
  index,
  remove,
  errors,
  isPrimary,
  canRemove,
  touchedFields,
  isSubmitted,
  value,
  onChange,
}) => {
  const platformTouched = touchedFields.social_links?.[index]?.platform;
  const urlTouched = touchedFields.social_links?.[index]?.url;

  const handlePlatformChange = useCallback(
    (keys: any) => {
      const selectedKey = Array.from(keys)[0] as string;
      if (selectedKey !== undefined) {
        onChange({ ...value, platform: selectedKey });
      }
    },
    [onChange, value],
  );

  const handleUrlChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange({ ...value, url: e.target.value });
    },
    [onChange, value],
  );

  return (
    <div className="flex items-stretch border-b border-black/5 bg-white">
      <div className="flex-1 border-r border-black/10 p-[10px]">
        <Select
          selectedKeys={value?.platform ? [value.platform] : []}
          onSelectionChange={handlePlatformChange}
          placeholder="Select platform"
          aria-label="Select social platform"
          classNames={{
            base: 'max-w-full',
            trigger: `h-[32px] min-h-[32px] border-none bg-transparent shadow-none px-0 ${
              platformTouched && errors?.platform ? 'bg-red-50' : ''
            }`,
            value: 'text-[14px] font-[600] leading-[19px] text-black pl-0',
            mainWrapper: 'border-none shadow-none',
            innerWrapper: 'px-0',
            listboxWrapper: 'bg-white',
            popoverContent: 'bg-white',
          }}
          radius="none"
        >
          {SOCIAL_PLATFORMS.map((platform) => (
            <SelectItem key={platform.value} textValue={platform.label}>
              {platform.label}
            </SelectItem>
          ))}
        </Select>
        {errors?.platform && (platformTouched || !isPrimary || isSubmitted) && (
          <span className="text-[13px] text-red-500">
            {typeof errors.platform === 'string'
              ? errors.platform
              : errors.platform?.message || 'Platform is required'}
          </span>
        )}
      </div>
      <div className="flex-1 p-[10px]">
        <input
          type="text"
          placeholder="Type a URL"
          value={value?.url || ''}
          onChange={handleUrlChange}
          className={`h-[20px] w-full border-none bg-transparent px-0 text-[13px] font-[400] leading-[18px] text-black placeholder:text-black/60 focus:shadow-none focus:outline-none focus:ring-0`}
          style={{
            boxShadow: 'none !important',
            outline: 'none !important',
            border: 'none !important',
          }}
        />
        {errors?.url && (urlTouched || !isPrimary || isSubmitted) && (
          <span className="text-[13px] text-red-500">
            {typeof errors.url === 'string'
              ? errors.url
              : errors.url?.message || 'URL is required'}
          </span>
        )}
      </div>
      <div className="flex w-[60px] items-center justify-center">
        {canRemove && (
          <button
            type="button"
            className="flex size-[40px] cursor-pointer items-center justify-center  rounded-full border-none bg-transparent p-[8px] opacity-30"
            onClick={() => remove(index)}
            aria-label={`Remove social link ${index + 1}`}
            style={{
              outline: 'none',
              boxShadow: 'none',
            }}
          >
            <XCircle size={24} />
          </button>
        )}
      </div>
    </div>
  );
};

export default SocialLinkFormItemTable;
