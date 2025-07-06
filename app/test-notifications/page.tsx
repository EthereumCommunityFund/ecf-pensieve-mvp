'use client';

import {
  NotificationDropdown,
  NotificationPanel,
} from '@/components/notification';

export default function TestNotificationsPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <h1 className="mb-8 text-center text-3xl font-bold">
          通知组件测试页面
        </h1>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="rounded-lg bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-xl font-semibold">通知下拉菜单</h2>
            <p className="mb-4 text-gray-600">
              点击下面的通知图标测试下拉菜单功能
            </p>
            <div className="flex justify-center">
              <NotificationDropdown />
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-xl font-semibold">通知面板</h2>
            <p className="mb-4 text-gray-600">独立的通知面板组件</p>
            <div className="flex justify-center">
              <NotificationPanel />
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-lg">
          <h2 className="mb-4 text-xl font-semibold">使用说明</h2>
          <ul className="space-y-2 text-gray-600">
            <li>• 点击通知图标应该会显示下拉菜单</li>
            <li>• 即使没有数据，也应该显示"No notifications"状态</li>
            <li>• 菜单应该包含头部、标签筛选和底部操作按钮</li>
            <li>• 如果用户未登录，可能不会显示通知</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
