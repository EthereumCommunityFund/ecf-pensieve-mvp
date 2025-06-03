import { useRouter } from 'next/router';

import { trpc } from '@/lib/trpc/client';

export default function ItemProposalDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const itemProposalId = Number(id);

  // 查询item proposal详情
  const {
    data: itemProposal,
    isLoading,
    error,
  } = trpc.itemProposal.getItemProposalById.useQuery(
    { id: itemProposalId },
    { enabled: !!itemProposalId && !isNaN(itemProposalId) },
  );

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto size-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mb-4 text-6xl text-red-500">⚠️</div>
          <h1 className="mb-2 text-2xl font-bold text-gray-900">加载失败</h1>
          <p className="mb-4 text-gray-600">{error.message}</p>
          <button
            onClick={() => router.back()}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
          >
            返回
          </button>
        </div>
      </div>
    );
  }

  if (!itemProposal) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mb-4 text-6xl text-gray-400">📄</div>
          <h1 className="mb-2 text-2xl font-bold text-gray-900">提案不存在</h1>
          <p className="mb-4 text-gray-600">
            找不到ID为 {itemProposalId} 的提案
          </p>
          <button
            onClick={() => router.back()}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
          >
            返回
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* 头部 */}
        <div className="mb-6 rounded-lg bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">提案详情</h1>
            <button
              onClick={() => router.back()}
              className="rounded-lg bg-gray-100 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-200"
            >
              返回
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 text-sm text-gray-600 md:grid-cols-2">
            <div>
              <span className="font-medium">提案ID:</span> {itemProposal.id}
            </div>
            <div>
              <span className="font-medium">创建时间:</span>{' '}
              {new Date(itemProposal.createdAt).toLocaleString('zh-CN')}
            </div>
            <div>
              <span className="font-medium">项目ID:</span>{' '}
              {itemProposal.projectId}
            </div>
            <div>
              <span className="font-medium">字段键名:</span> {itemProposal.key}
            </div>
          </div>
        </div>

        {/* 项目信息 */}
        {itemProposal.project && (
          <div className="mb-6 rounded-lg bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              关联项目
            </h2>
            <div className="space-y-2">
              <div>
                <span className="font-medium text-gray-700">项目名称:</span>
                <span className="ml-2 text-gray-900">
                  {itemProposal.project.name}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">项目标语:</span>
                <span className="ml-2 text-gray-600">
                  {itemProposal.project.tagline}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">发布状态:</span>
                <span
                  className={`ml-2 rounded-full px-2 py-1 text-xs ${
                    itemProposal.project.isPublished
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {itemProposal.project.isPublished ? '已发布' : '未发布'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 创建者信息 */}
        {itemProposal.creator && (
          <div className="mb-6 rounded-lg bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">创建者</h2>
            <div className="flex items-center space-x-4">
              {itemProposal.creator.avatarUrl && (
                <img
                  src={itemProposal.creator.avatarUrl}
                  alt={itemProposal.creator.name}
                  className="size-12 rounded-full"
                />
              )}
              <div>
                <div className="font-medium text-gray-900">
                  {itemProposal.creator.name}
                </div>
                <div className="text-sm text-gray-500">
                  {itemProposal.creator.userId}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 提案内容 */}
        <div className="mb-6 rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">提案内容</h2>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                提案值
              </label>
              <div className="rounded-lg bg-gray-50 p-4">
                <pre className="whitespace-pre-wrap text-sm text-gray-900">
                  {JSON.stringify(itemProposal.value, null, 2)}
                </pre>
              </div>
            </div>

            {itemProposal.ref && (
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  参考链接
                </label>
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

            {itemProposal.reason && (
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  提案原因
                </label>
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-gray-900">{itemProposal.reason}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 投票记录 */}
        {itemProposal.voteRecords && itemProposal.voteRecords.length > 0 && (
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              投票记录 ({itemProposal.voteRecords.length})
            </h2>
            <div className="space-y-3">
              {itemProposal.voteRecords.map((vote) => (
                <div
                  key={vote.id}
                  className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
                >
                  <div className="flex items-center space-x-3">
                    {vote.creator?.avatarUrl && (
                      <img
                        src={vote.creator.avatarUrl}
                        alt={vote.creator.name}
                        className="size-8 rounded-full"
                      />
                    )}
                    <div>
                      <div className="font-medium text-gray-900">
                        {vote.creator?.name || '未知用户'}
                      </div>
                      <div className="text-sm text-gray-500">
                        权重: {vote.weight}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(vote.createdAt).toLocaleString('zh-CN')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
