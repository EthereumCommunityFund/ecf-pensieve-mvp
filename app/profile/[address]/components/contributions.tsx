import { cn, Skeleton, Tab, Tabs } from '@heroui/react';
import { ResponsiveCalendar } from '@nivo/calendar';
import { scaleThreshold } from 'd3-scale';
import { useMemo, useState } from 'react';

import ECFTypography from '@/components/base/typography';
import dayjs from '@/lib/dayjs';
import { trpc } from '@/lib/trpc/client';

import ActivityItem from './activityItem';
import { useProfileData } from './dataContext';

const contributionsColorScale = scaleThreshold<number, string>()
  .domain([5, 10, 15, 20])
  .range(['#aceebb', '#4ac26b', '#2da44e', '#116329']);

const tabItems = [
  { key: 'all', label: 'View All' },
  { key: 'edits', label: 'Edits' },
  { key: 'votes', label: 'Votes' },
  { key: 'proposals', label: 'Proposals' },
];

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

  const [activeTab, setActiveTab] = useState('all');

  const { data: activitiesData, isLoading: isLoadingActivities } =
    trpc.active.getUserActivities.useQuery(
      {
        userId: user?.userId ?? '',
        limit: 100,
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

  const filteredActivities = useMemo(() => {
    if (!activitiesData?.items) return [];

    if (activeTab === 'all') return activitiesData.items;

    const typeMap: Record<string, string[]> = {
      edits: ['edit'],
      votes: ['vote', 'vote_retract'],
      proposals: ['proposal'],
    };

    const allowedTypes = typeMap[activeTab] || [];
    return activitiesData.items.filter((item) =>
      allowedTypes.includes(item.activeLog.type),
    );
  }, [activitiesData?.items, activeTab]);

  return (
    <div className="flex w-full flex-col gap-[20px]">
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

      <ECFTypography type="body1" className="font-semibold">
        Your Activity
      </ECFTypography>

      <div className="w-full">
        <Tabs
          selectedKey={activeTab}
          onSelectionChange={(key) => {
            setActiveTab(key as string);
          }}
          variant="underlined"
          className="w-full"
          classNames={{
            tabList: 'w-full border-b border-[rgba(0,0,0,0.1)] gap-[20px]',
            tab: 'w-fit flex justify-start items-center',
            cursor: 'bg-black w-[102%] bottom-[-4px] left-[-4px] right-[-4px]',
            tabContent: 'font-semibold',
          }}
        >
          {tabItems.map(({ key, label }) => (
            <Tab
              key={key}
              title={
                <ECFTypography
                  type="body1"
                  className={cn(
                    'font-semibold',
                    activeTab === key ? 'opacity-100' : 'opacity-60',
                  )}
                >
                  {label}
                </ECFTypography>
              }
            />
          ))}
        </Tabs>
      </div>

      <div className="flex w-full flex-col">
        {isLoadingActivities ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="flex w-full items-start py-4">
                <div className="relative flex size-8 shrink-0 items-center justify-center">
                  <Skeleton className="size-8 rounded-full" />
                  {index < 4 && (
                    <div className="absolute left-1/2 top-8 h-8 w-px -translate-x-1/2 border-l border-black/10" />
                  )}
                </div>
                <div className="ml-2.5 flex w-full items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-48 rounded" />
                    <Skeleton className="h-3 w-32 rounded" />
                  </div>
                  <Skeleton className="h-6 w-20 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredActivities.length > 0 ? (
          filteredActivities.map((activity, index) => (
            <ActivityItem
              key={activity.activeLog.id}
              activity={activity}
              isLast={index === filteredActivities.length - 1}
            />
          ))
        ) : (
          <div className="py-8 text-center">
            <ECFTypography type="body1" className="opacity-60">
              No activities found for this filter.
            </ECFTypography>
          </div>
        )}
      </div>
    </div>
  );
}
