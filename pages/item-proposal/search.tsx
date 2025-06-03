import { useRouter } from 'next/router';
import { useState } from 'react';

import { trpc } from '@/lib/trpc/client';

export default function ItemProposalSearchPage() {
  const router = useRouter();
  const [searchId, setSearchId] = useState('');
  const [queriedId, setQueriedId] = useState<number | null>(null);

  // 查询item proposal详情
  const {
    data: itemProposal,
    isLoading,
    error,
  } = trpc.itemProposal.getItemProposalById.useQuery(
    { id: queriedId! },
    { enabled: !!queriedId && !isNaN(queriedId) },
  );

  const handleSearch = () => {
    const id = Number(searchId);
    if (isNaN(id) || id <= 0) {
      alert('请输入有效的提案ID（正整数）');
      return;
    }
    setQueriedId(id);
  };

  const handleViewDetail = () => {
    if (queriedId) {
      router.push(`/item-proposal/${queriedId}`);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* 头部 */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">提案查询</h1>
          <p className="text-gray-600">输入提案ID来查询详细信息</p>
        </div>

        {/* 搜索框 */}
        <div className="mb-6 rounded-lg bg-white p-6 shadow-sm">
          <div className="flex space-x-4">
            <div className="flex-1">
              <label
                htmlFor="search-id"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                提案ID
              </label>
              <input
                id="search-id"
                type="number"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="请输入提案ID，例如：1"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleSearch}
                disabled={!searchId.trim()}
                className="rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                查询
              </button>
            </div>
          </div>
        </div>

        {/* 加载状态 */}
        {isLoading && (
          <div className="rounded-lg bg-white p-8 text-center shadow-sm">
            <div className="mx-auto mb-4 size-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
            <p className="text-gray-600">正在查询提案 ID: {queriedId}</p>
          </div>
        )}

        {/* 错误状态 */}
        {error && (
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <div className="text-center">
              <div className="mb-4 text-4xl text-red-500">⚠️</div>
              <h2 className="mb-2 text-xl font-semibold text-gray-900">
                查询失败
              </h2>
              <p className="mb-4 text-gray-600">{error.message}</p>
              <button
                onClick={() => setQueriedId(null)}
                className="rounded-lg bg-gray-100 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-200"
              >
                重新查询
              </button>
            </div>
          </div>
        )}

        {/* 查询结果 */}
        {itemProposal && !isLoading && (
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">查询结果</h2>
              <button
                onClick={handleViewDetail}
                className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
              >
                查看详情
              </button>
            </div>

            {/* 基本信息 */}
            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    提案ID
                  </span>
                  <div className="text-lg font-semibold text-gray-900">
                    {itemProposal.id}
                  </div>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    字段键名
                  </span>
                  <div className="text-gray-900">{itemProposal.key}</div>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    创建时间
                  </span>
                  <div className="text-gray-900">
                    {new Date(itemProposal.createdAt).toLocaleString('zh-CN')}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    项目ID
                  </span>
                  <div className="text-gray-900">{itemProposal.projectId}</div>
                </div>
                {itemProposal.project && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">
                      项目名称
                    </span>
                    <div className="text-gray-900">
                      {itemProposal.project.name}
                    </div>
                  </div>
                )}
                {itemProposal.creator && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">
                      创建者
                    </span>
                    <div className="text-gray-900">
                      {itemProposal.creator.name}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 提案内容预览 */}
            <div className="border-t pt-4">
              <h3 className="mb-3 text-lg font-medium text-gray-900">
                提案内容预览
              </h3>
              <div className="rounded-lg bg-gray-50 p-4">
                <pre className="overflow-x-auto whitespace-pre-wrap text-sm text-gray-700">
                  {JSON.stringify(itemProposal.value, null, 2)}
                </pre>
              </div>

              {itemProposal.reason && (
                <div className="mt-4">
                  <h4 className="mb-2 text-sm font-medium text-gray-700">
                    提案原因
                  </h4>
                  <p className="rounded-lg bg-gray-50 p-3 text-gray-600">
                    {itemProposal.reason}
                  </p>
                </div>
              )}

              {itemProposal.ref && (
                <div className="mt-4">
                  <h4 className="mb-2 text-sm font-medium text-gray-700">
                    参考链接
                  </h4>
                  <a
                    href={itemProposal.ref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline hover:text-blue-800"
                  >
                    {itemProposal.ref}
                  </a>
                </div>
              )}
            </div>

            {/* 投票统计 */}
            {itemProposal.voteRecords && (
              <div className="mt-4 border-t pt-4">
                <h3 className="mb-3 text-lg font-medium text-gray-900">
                  投票统计
                </h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="rounded-lg bg-blue-50 p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {itemProposal.voteRecords.length}
                    </div>
                    <div className="text-sm text-blue-800">总投票数</div>
                  </div>
                  <div className="rounded-lg bg-green-50 p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {itemProposal.voteRecords
                        .reduce((sum, vote) => sum + vote.weight, 0)
                        .toFixed(2)}
                    </div>
                    <div className="text-sm text-green-800">总权重</div>
                  </div>
                  <div className="rounded-lg bg-purple-50 p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {itemProposal.voteRecords.length > 0
                        ? (
                            itemProposal.voteRecords.reduce(
                              (sum, vote) => sum + vote.weight,
                              0,
                            ) / itemProposal.voteRecords.length
                          ).toFixed(2)
                        : '0'}
                    </div>
                    <div className="text-sm text-purple-800">平均权重</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 使用说明 */}
        <div className="mt-6 rounded-lg bg-blue-50 p-6">
          <h3 className="mb-3 text-lg font-medium text-blue-900">使用说明</h3>
          <ul className="space-y-2 text-blue-800">
            <li>• 在搜索框中输入提案ID（正整数）</li>
            <li>• 点击"查询"按钮或按回车键开始查询</li>
            <li>• 查询结果会显示提案的基本信息、内容预览和投票统计</li>
            <li>• 点击"查看详情"按钮可以跳转到完整的提案详情页面</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
