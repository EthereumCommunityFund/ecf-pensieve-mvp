'use client';

import { DatePicker, Select, SelectItem } from '@heroui/react';
import { DateValue, parseDate } from '@internationalized/date';
import dayjs from 'dayjs';
import React, { useEffect } from 'react';
import { Controller } from 'react-hook-form';

import { datesFieldsConfig } from '@/components/pages/project/create/formData';

import { FormFieldContainer } from '../FormFieldContainer';
import { ProjectFormData, StepFormProps } from '../types';

const DatesStepForm: React.FC<Omit<StepFormProps, 'register'>> = ({
  control,
  errors,
  watch,
  setValue,
  onAddReference,
}) => {
  const launchDateConfig = datesFieldsConfig.dateLaunch;
  const launchDateApplicableKey = launchDateConfig?.applicableKey;

  const fundingStatusConfig = datesFieldsConfig.fundingStatus;
  const fundingStatusApplicableKey = fundingStatusConfig?.applicableKey;

  const isLaunchDateApplicable = launchDateApplicableKey
    ? !!watch(launchDateApplicableKey)
    : true;
  const isFundingStatusApplicable = fundingStatusApplicableKey
    ? !!watch(fundingStatusApplicableKey)
    : true;

  useEffect(() => {
    if (!isLaunchDateApplicable && launchDateConfig) {
      setValue(launchDateConfig.key, null, { shouldValidate: true });
    }
    if (!isFundingStatusApplicable && fundingStatusConfig) {
      setValue(fundingStatusConfig.key, null, { shouldValidate: true });
    }
  }, [
    isLaunchDateApplicable,
    isFundingStatusApplicable,
    setValue,
    launchDateConfig,
    fundingStatusConfig,
  ]);

  const devStatusOptions = datesFieldsConfig.devStatus?.options || [];
  const fundingStatusOptions = datesFieldsConfig.fundingStatus?.options || [];

  const dateToDateValue = (date: Date | null | undefined): DateValue | null => {
    if (!date) return null;
    try {
      const dateString = dayjs(date).format('YYYY-MM-DD');
      return parseDate(dateString);
    } catch (e) {
      console.error('Error parsing date for DatePicker:', date, e);
      return null;
    }
  };

  const dateValueToDate = (dateValue: DateValue | null): Date | null => {
    if (!dateValue) return null;
    try {
      return dayjs(dateValue.toString()).toDate();
    } catch (e) {
      console.error('Error converting DateValue to Date:', dateValue, e);
      return null;
    }
  };

  return (
    <div className="flex flex-col gap-[40px]">
      <FormFieldContainer
        label={datesFieldsConfig.dateFounded.label}
        description={datesFieldsConfig.dateFounded.description}
        shortDescription={datesFieldsConfig.dateFounded.shortDescription}
        weight={datesFieldsConfig.dateFounded.weight}
        showReference={datesFieldsConfig.dateFounded.showReference}
        onAddReference={
          datesFieldsConfig.dateFounded.showReference
            ? () =>
                onAddReference(
                  datesFieldsConfig.dateFounded.key,
                  datesFieldsConfig.dateFounded.label,
                )
            : undefined
        }
      >
        <Controller
          name={datesFieldsConfig.dateFounded.key}
          control={control}
          render={({ field, fieldState: { error } }) => {
            return (
              <DatePicker
                value={dateToDateValue(field.value)}
                onChange={(value: DateValue | null) => {
                  field.onChange(dateValueToDate(value));
                }}
                isInvalid={!!error}
                errorMessage={error?.message}
                isRequired
                className="w-full"
                aria-label={datesFieldsConfig.dateFounded.label}
              />
            );
          }}
        />
      </FormFieldContainer>

      {launchDateApplicableKey && (
        <FormFieldContainer
          label={launchDateConfig.label}
          description={launchDateConfig.description}
          shortDescription={launchDateConfig.shortDescription}
          weight={launchDateConfig.weight}
          showReference={launchDateConfig.showReference}
          showApplicable={launchDateConfig.showApplicable}
          isApplicable={isLaunchDateApplicable}
          onApplicableChange={
            launchDateConfig.showApplicable
              ? (isSelected) =>
                  setValue(launchDateApplicableKey, isSelected, {
                    shouldValidate: true,
                  })
              : undefined
          }
          onAddReference={
            launchDateConfig.showReference
              ? () =>
                  onAddReference(launchDateConfig.key, launchDateConfig.label)
              : undefined
          }
        >
          <Controller
            name={launchDateConfig.key}
            control={control}
            render={({ field, fieldState: { error } }) => {
              return (
                <DatePicker
                  value={dateToDateValue(field.value)}
                  onChange={(value: DateValue | null) => {
                    field.onChange(dateValueToDate(value));
                  }}
                  isInvalid={!!error}
                  errorMessage={error?.message}
                  isDisabled={!isLaunchDateApplicable}
                  className="w-full"
                  aria-label={launchDateConfig.label}
                />
              );
            }}
          />
        </FormFieldContainer>
      )}

      <FormFieldContainer
        label={datesFieldsConfig.devStatus.label}
        description={datesFieldsConfig.devStatus.description}
        shortDescription={datesFieldsConfig.devStatus.shortDescription}
        weight={datesFieldsConfig.devStatus.weight}
        showReference={datesFieldsConfig.devStatus.showReference}
        onAddReference={
          datesFieldsConfig.devStatus.showReference
            ? () =>
                onAddReference(
                  datesFieldsConfig.devStatus.key,
                  datesFieldsConfig.devStatus.label,
                )
            : undefined
        }
      >
        <Controller
          name={datesFieldsConfig.devStatus.key}
          control={control}
          render={({ field, fieldState: { error } }) => (
            <Select
              aria-label={datesFieldsConfig.devStatus.label}
              placeholder={datesFieldsConfig.devStatus.placeholder}
              selectedKeys={field.value ? [field.value] : []}
              onSelectionChange={(keys) => {
                const value = Array.from(keys)[0] ?? '';
                field.onChange(value as ProjectFormData['devStatus']);
              }}
              isInvalid={!!error}
              errorMessage={error?.message}
              items={devStatusOptions}
              className="w-full"
            >
              {(item) => (
                <SelectItem key={item.value} textValue={item.label}>
                  {item.label}
                </SelectItem>
              )}
            </Select>
          )}
        />
      </FormFieldContainer>

      {fundingStatusApplicableKey && (
        <FormFieldContainer
          label={fundingStatusConfig.label}
          description={fundingStatusConfig.description}
          shortDescription={fundingStatusConfig.shortDescription}
          weight={fundingStatusConfig.weight}
          showReference={fundingStatusConfig.showReference}
          showApplicable={fundingStatusConfig.showApplicable}
          isApplicable={isFundingStatusApplicable}
          onApplicableChange={
            fundingStatusConfig.showApplicable
              ? (isSelected) =>
                  setValue(fundingStatusApplicableKey, isSelected, {
                    shouldValidate: true,
                  })
              : undefined
          }
          onAddReference={
            fundingStatusConfig.showReference
              ? () =>
                  onAddReference(
                    fundingStatusConfig.key,
                    fundingStatusConfig.label,
                  )
              : undefined
          }
        >
          <Controller
            name={fundingStatusConfig.key}
            control={control}
            render={({ field, fieldState: { error } }) => (
              <Select
                aria-label={fundingStatusConfig.label}
                placeholder={fundingStatusConfig.placeholder}
                selectedKeys={field.value ? [field.value] : []}
                onSelectionChange={(keys) => {
                  const value = Array.from(keys)[0] ?? null;
                  field.onChange(value as ProjectFormData['fundingStatus']);
                }}
                isInvalid={!!error}
                errorMessage={error?.message}
                items={fundingStatusOptions}
                isDisabled={!isFundingStatusApplicable}
                className="w-full"
              >
                {(item) => (
                  <SelectItem key={item.value} textValue={item.label}>
                    {item.label}
                  </SelectItem>
                )}
              </Select>
            )}
          />
        </FormFieldContainer>
      )}
    </div>
  );
};

export default DatesStepForm;
