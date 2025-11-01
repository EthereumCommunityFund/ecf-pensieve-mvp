import {
  DatePickerProps,
  DatePicker as HDatePicker,
  HeroUIProvider,
  cn,
} from '@heroui/react';

interface LocaleDatePickerProps extends DatePickerProps {
  locale?: string;
}

function LocaleDatePicker({
  locale = 'en-CA',
  classNames,
  ...props
}: LocaleDatePickerProps) {
  return (
    <HeroUIProvider locale={locale}>
      <HDatePicker
        variant="bordered"
        classNames={{
          base: cn('', classNames?.base),
          inputWrapper: cn(
            'bg-[rgba(0,0,0,0.05)] border border-black/10 rounded-[8px]',
            'hover:border-black/40',
            'group-data-[focus=true]:border-black/40',
            'group-data-[focus=true]:bg-[rgba(0,0,0,0.05)]',
            'group-data-[focus-visible=true]:border-black/40',
            'group-data-[focus-visible=true]:bg-[rgba(0,0,0,0.05)]',
            classNames?.inputWrapper,
          ),
          selectorButton: cn('opacity-50', classNames?.selectorButton),
          selectorIcon: cn('', classNames?.selectorIcon),
          popoverContent: cn('', classNames?.popoverContent),
          calendar: cn('', classNames?.calendar),
          calendarContent: cn('', classNames?.calendarContent),
          timeInputLabel: cn('', classNames?.timeInputLabel),
          timeInput: cn('', classNames?.timeInput),
          errorMessage: cn(classNames?.errorMessage),
        }}
        {...props}
      />
    </HeroUIProvider>
  );
}

export { LocaleDatePicker };
