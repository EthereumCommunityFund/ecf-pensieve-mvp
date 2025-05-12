import { Skeleton } from '@heroui/react';
import { ResponsiveCalendar } from '@nivo/calendar';
import { scaleThreshold } from 'd3-scale';
import { useMemo } from 'react';

import ECFTypography from '@/components/base/typography';
import dayjs from '@/lib/dayjs';
import { trpc } from '@/lib/trpc/client';

import { useProfileData } from './dataContext';

const contributionsColorScale = scaleThreshold<number, string>()
  .domain([5, 10, 15, 20])
  .range(['#aceebb', '#4ac26b', '#2da44e', '#116329']);

export default function Contributions() {
  const currentYearStart = dayjs().startOf('year').format('YYYY-MM-DD');
  const currentYearEnd = dayjs().endOf('year').format('YYYY-MM-DD');

  const { user } = useProfileData();
  const { data: contributions, isLoading } =
    trpc.active.getUserDailyActivities.useQuery(
      {
        userId: user?.userId ?? '',
        startDate: currentYearStart,
        endDate: currentYearEnd,
      },
      {
        enabled: !!user?.userId,
      },
    );

  const isLoadingContributions = isLoading || !user?.userId;

  const contributionsAmount = useMemo(() => {
    return contributions?.reduce(
      (acc, contribution) => acc + contribution.value,
      0,
    );
  }, [contributions]);

  return (
    <div className="w-full">
      <div className="h-[156px] w-full px-[45px]">
        <div className="relative size-full overflow-hidden rounded-[10px] border border-black/10 bg-white">
          <div
            style={{ height: 'calc(100% - 30px)' }}
            className="overflow-x-auto"
          >
            <div id="active-contributions" className="h-full min-w-[708px]">
              {isLoadingContributions ? (
                <Skeleton className="m-[10px] h-[114px] rounded-lg" />
              ) : (
                <ResponsiveCalendar
                  data={contributions ?? []}
                  from={currentYearStart}
                  to={currentYearEnd}
                  emptyColor="#EBEBEB"
                  colorScale={contributionsColorScale as any}
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
              )}
            </div>
          </div>
          {isLoadingContributions ? (
            <Skeleton
              isLoaded={!isLoadingContributions}
              className="absolute inset-x-0 bottom-[10px] mx-auto h-[12px] w-[200px] rounded-sm"
            />
          ) : (
            <ECFTypography
              type="caption1"
              className="absolute inset-x-0 bottom-[10px] text-center opacity-80"
            >
              {contributionsAmount} contributions this year
            </ECFTypography>
          )}
        </div>
      </div>
    </div>
  );
}
