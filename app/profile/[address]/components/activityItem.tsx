import { Button } from '@heroui/react';
import { useMemo } from 'react';

import ECFTypography from '@/components/base/typography';
import { formatTimeAgo } from '@/lib/utils';

// 图标组件
const PencilCircleIcon = ({ className }: { className?: string }) => (
  <div className={`rounded-full bg-white p-2 opacity-30 ${className || ''}`}>
    <svg width="16" height="16" viewBox="0 0 26 26" fill="none">
      <path
        d="M20.5 4.5L21.5 5.5L8.5 18.5L4.5 19.5L5.5 15.5L18.5 2.5L20.5 4.5Z"
        fill="currentColor"
      />
    </svg>
  </div>
);

const CaretCircleUpIcon = ({ className }: { className?: string }) => (
  <div className={`rounded-full bg-white p-2 opacity-30 ${className || ''}`}>
    <svg width="16" height="16" viewBox="0 0 26 26" fill="none">
      <path d="M13 8L19 14H7L13 8Z" fill="currentColor" />
    </svg>
  </div>
);

const CubeFocusIcon = ({ className }: { className?: string }) => (
  <div className={`rounded-full bg-white p-2 opacity-30 ${className || ''}`}>
    <svg width="16" height="16" viewBox="0 0 26 22" fill="none">
      <path d="M2 6L13 1L24 6L13 11L2 6Z" fill="currentColor" />
      <path
        d="M2 11L13 16L24 11"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M2 16L13 21L24 16"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
    </svg>
  </div>
);

// 更新接口以匹配真实的 API 数据结构
export interface ActivityItemData {
  activeLog: {
    id: string;
    createdAt: Date;
    userId: string;
    action: string;
    type: string;
    targetId: number;
    projectId: number | null;
    items: any;
    proposalCreatorId: string | null;
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
  const timeAgo = useMemo(() => {
    return formatTimeAgo(activity.activeLog.createdAt.getTime());
  }, [activity.activeLog.createdAt]);

  const getIcon = () => {
    switch (activity.activeLog.type) {
      case 'edit':
        return <PencilCircleIcon className="size-8" />;
      case 'vote':
      case 'vote_retract':
        return <CaretCircleUpIcon className="size-8" />;
      case 'proposal':
        return <CubeFocusIcon className="size-8" />;
      default:
        return <PencilCircleIcon className="size-8" />;
    }
  };

  const renderAction = () => {
    const parts = [];
    const { type, action, items } = activity.activeLog;

    // 基于 action 和 type 生成描述
    parts.push(
      <ECFTypography key="action" type="caption1" className="font-semibold">
        {action}
      </ECFTypography>,
    );

    // 如果有 items 数据，显示相关信息
    if (items && typeof items === 'object') {
      if (items.itemName) {
        parts.push(
          <div
            key="itemname"
            className="rounded-[10px] border border-black/10 px-2 py-0.5"
          >
            <ECFTypography type="caption" className="text-black">
              {items.itemName}
            </ECFTypography>
          </div>,
        );
      }

      if (items.username && (type === 'vote' || type === 'vote_retract')) {
        parts.push(
          <ECFTypography key="by" type="caption1" className="opacity-50">
            by
          </ECFTypography>,
          <div
            key="username"
            className="rounded-[10px] border border-black/10 px-2 py-0.5"
          >
            <ECFTypography type="caption" className="text-black">
              {items.username}
            </ECFTypography>
          </div>,
        );
      }
    }

    // 添加项目名称
    if (activity.projectName) {
      parts.push(
        <ECFTypography key="in" type="caption1" className="opacity-50">
          in
        </ECFTypography>,
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

    // 添加时间
    parts.push(
      <ECFTypography key="time" type="caption1" className="opacity-50">
        {timeAgo}
      </ECFTypography>,
    );

    return parts;
  };

  return (
    <div className="flex w-full items-start py-4">
      {/* 图标区域 - 包含图标和下方的连接线 */}
      <div className="relative flex size-8 shrink-0 items-center justify-center">
        {getIcon()}
        {/* 垂直连接线 - 从图标中心向下延伸到下一个图标 */}
        {!isLast && (
          <div className="absolute left-1/2 top-8 h-8 w-px -translate-x-1/2 border-l border-black/10" />
        )}
      </div>

      {/* 活动内容 */}
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
          variant="bordered"
          className="rounded-md border-black/10 bg-black/5 px-2.5 py-1 text-xs font-normal"
        >
          View in Project
        </Button>
      </div>
    </div>
  );
}
