import { ResponsiveCalendar } from '@nivo/calendar';

import ECFTypography from '@/components/base/typography';
import dayjs from '@/lib/dayjs';

export default function Contributions() {
  const data = [
    { day: '2025-03-01', value: 3 },
    { day: '2025-03-02', value: 2 },
    { day: '2025-03-03', value: 1 },
    { day: '2025-03-04', value: 0 },
  ];

  const currentYearStart = dayjs().startOf('year').format('YYYY-MM-DD');
  const currentYearEnd = dayjs().endOf('year').format('YYYY-MM-DD');

  return (
    <div className="w-full">
      <div className="h-[156px] w-full px-[45px]">
        <div className="relative size-full overflow-hidden rounded-[10px] border border-black/10 bg-white">
          <div
            style={{ height: 'calc(100% - 30px)' }}
            className="overflow-x-auto"
          >
            <div className="h-full min-w-[708px]">
              <ResponsiveCalendar
                data={data}
                from={currentYearStart}
                to={currentYearEnd}
                emptyColor="#EBEBEB"
                colors={['#61cdbb', '#97e3d5', '#e8c1a0', '#f47560']}
                margin={{ top: 10, right: 10, bottom: -20, left: 10 }}
                yearSpacing={40}
                monthBorderColor="transparent"
                dayBorderWidth={2}
                dayBorderColor="#ffffff"
                yearLegend={() => ''}
                theme={{
                  text: {
                    fontSize: 12,
                    fill: 'rgba(0, 0, 0, 0.3)',
                    fontWeight: 500,
                  },
                }}
                tooltip={({ day, value }) => (
                  <div className="rounded bg-[#25292e] p-1 px-2 text-xs text-white">
                    {value} contributions on {dayjs(day).format('MMMM Do')}.
                  </div>
                )}
              />
            </div>
          </div>
          <ECFTypography
            type="caption1"
            className="absolute inset-x-0 bottom-[10px] text-center opacity-80"
          >
            000 contributions this year
          </ECFTypography>
        </div>
      </div>
    </div>
  );
}
