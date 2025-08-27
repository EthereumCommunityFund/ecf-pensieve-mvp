'use client';

import { DateValue } from '@internationalized/date';
import React from 'react';

import { DatePicker } from '@/components/base';
import { dateToDateValue, dateValueToDate } from '@/utils/formatters';

interface DateInputProps {
  value?: Date | null;
  onChange: (value: Date | null) => void;
  disabled?: boolean;
  error?: string;
  className?: string;
}

const DateInput: React.FC<DateInputProps> = ({
  value = null,
  onChange,
  disabled = false,
  error,
  className = '',
}) => {
  const handleDateChange = (dateValue: DateValue | null) => {
    const date = dateValueToDate(dateValue);
    onChange(date);
  };

  return (
    <div className={`w-full ${className}`}>
      <DatePicker
        showMonthAndYearPickers={true}
        value={dateToDateValue(value)}
        onChange={handleDateChange}
        isInvalid={!!error}
        isDisabled={disabled}
        className="w-full"
        radius="sm"
        classNames={{
          base: '!h-[40px] m-0',
          inputWrapper: '!h-[40px] border-none bg-transparent shadow-none',
          segment: 'text-[13px] text-black/30 leading-[20px]',
          popoverContent: 'z-[100]',
          selectorButton: 'hidden',
          timeInput: 'text-[13px] text-black/30 leading-[20px]',
        }}
      />
      {error && <div className="mt-1 text-[13px] text-red-500">{error}</div>}
    </div>
  );
};

export default DateInput;
