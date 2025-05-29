import { Button } from '@heroui/react';
import { useMemo } from 'react';
import { CaretCircleUp, CubeFocus, PencilCircle } from '@phosphor-icons/react';
import { useRouter } from 'next/navigation';

import ECFTypography from '@/components/base/typography';
import { formatTimeAgo } from '@/lib/utils';

export interface ActivityItemData {
  activeLog: {
    id: string;
    createdAt: Date;
    userId: string;
    action: 'create' | 'update' | 'delete';
    type: 'proposal' | 'vote' | 'item_proposal';
    targetId: number;
    projectId: number | null;
    items: any;
    proposalCreatorId: string | null;
    user: {
      name: string;
    };
  };
  projectName?: string;
}

interface ActivityItemProps {
  activity: ActivityItemData;
  isLast?: boolean;
}

export default function ActivityItem({
  activity,
  isLast = false,
}: ActivityItemProps) {
  const router = useRouter();

  const timeAgo = useMemo(() => {
    return formatTimeAgo(activity.activeLog.createdAt.getTime());
  }, [activity.activeLog.createdAt]);

  const getIcon = () => {
    switch (activity.activeLog.type) {
      case 'item_proposal':
        return <PencilCircle size={32} className="opacity-30" />;
      case 'vote':
        return <CaretCircleUp size={32} weight="fill" className="opacity-30" />;
      case 'proposal':
        return <CubeFocus size={32} weight="fill" className="opacity-30" />;
      default:
        return <PencilCircle size={32} className="opacity-30" />;
    }
  };

  const renderAction = () => {
    const parts = [];
    const { type, action, items, user } = activity.activeLog;

    if (action === 'create' && type === 'proposal') {
      parts.push(
        <ECFTypography key="action" type="body2">
          <span className="font-semibold">You proposed</span>{' '}
          <span className="opacity-30">the</span>{' '}
          <span className="font-semibold">project,</span>
        </ECFTypography>,
      );
    } else if (action === 'create' && type === 'vote') {
      parts.push(
        <ECFTypography key="action" type="body2">
          <span className="font-semibold">You Voted</span>{' '}
          <span className="opacity-30">on</span>{' '}
        </ECFTypography>,
      );
    } else if (action === 'create' && type === 'item_proposal') {
      parts.push(
        <ECFTypography key="action" type="body2">
          <span className="font-semibold">You proposal</span>{' '}
          <span className="opacity-30">the</span>{' '}
          <span className="font-semibold">item,</span>
        </ECFTypography>,
      );
    } else if (action === 'update' && type === 'item_proposal') {
      parts.push(
        <ECFTypography key="action" type="body2">
          <span className="font-semibold">You submitted an edit</span>{' '}
          <span className="opacity-30">for</span>{' '}
        </ECFTypography>,
      );
    }

    if (items && Array.isArray(items)) {
      if (items.length > 0) {
        parts.push(
          <div
            key="itemname"
            className="rounded-[10px] border border-black/10 px-2 py-0.5"
          >
            <ECFTypography type="caption" className="text-black">
              {items[0].field}
            </ECFTypography>
          </div>,
        );
      }

      if (user?.name && type === 'vote') {
        parts.push(
          <ECFTypography key="by" type="caption1" className="opacity-50">
            by
          </ECFTypography>,
          <div
            key="username"
            className="rounded-[10px] border border-black/10 px-2 py-0.5"
          >
            <ECFTypography type="caption" className="text-black">
              {user.name}
            </ECFTypography>
          </div>,
          <ECFTypography key="in" type="caption1" className="opacity-50">
            in
          </ECFTypography>,
        );
      }
    }

    if (activity.projectName) {
      parts.push(
        <div
          key="projectname"
          className="rounded-[10px] border border-black/10 px-2 py-0.5"
        >
          <ECFTypography type="caption" className="text-black">
            {activity.projectName}
          </ECFTypography>
        </div>,
      );
    }

    parts.push(
      <ECFTypography key="time" type="caption1" className="opacity-50">
        {timeAgo}
      </ECFTypography>,
    );

    return parts;
  };

  return (
    <div className="flex w-full items-start py-4">
      <div className="relative flex size-8 shrink-0 items-center justify-center">
        {getIcon()}
        {!isLast && (
          <div className="absolute left-1/2 top-8 h-8 w-px -translate-x-1/2 border-l border-black/10" />
        )}
      </div>

      <div className="ml-2.5 flex w-full items-center justify-between">
        <div className="flex flex-col gap-2.5">
          <div className="flex flex-wrap items-center gap-1">
            {renderAction()}
          </div>
          {activity.activeLog.items?.reward && (
            <ECFTypography type="caption1" className="opacity-50">
              You've received zero-to-one reward:{' '}
              {activity.activeLog.items.reward}
            </ECFTypography>
          )}
        </div>
        <Button
          size="sm"
          variant="ghost"
          className="border-1 rounded-[5px] border-black/10 px-2.5 py-[5px] text-[13px]"
          onPress={() => {
            if (activity.activeLog.projectId) {
              router.push(`/project/${activity.activeLog.projectId}`);
            }
          }}
        >
          View in Project
        </Button>
      </div>
    </div>
  );
}
