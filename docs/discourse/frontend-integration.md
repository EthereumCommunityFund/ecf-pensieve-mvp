# Discourse 前端对接指南

本文汇总了 `projectDiscussionThread` 与 `projectDiscussionInteraction` 两个 tRPC 路由目前提供的能力，帮助前端将全局 Discourse 与项目级 Complaints 功能对接真实数据。

## 核心数据结构

| 模型 | 关键字段 | 说明 |
| --- | --- | --- |
| Thread (`project_discussion_threads`) | `id`, `projectId`, `creator`, `title`, `post`, `category[]`, `tags[]`, `isScam`, `createdAt` | 投诉主贴。`post` 为富文本 HTML 字符串，`category` 和 `tags` 为字符串数组。|
| Sentiment (`project_discussion_sentiments`) | `threadId?`, `answerId?`, `creator`, `type`, `createdAt` | 用户针对 Thread/Answer 的情绪记录，`type` 为自由字符串（前端约定为 `recommend/agree/insightful/provocative/disagree`）。|
| Answer (`project_discussion_answers`) | `id`, `threadId`, `creator`, `content`, `voteCount`, `comments[]`, `sentiments[]`, `createdAt` | 主贴下的结构化回答或 Counter Claim。`voteCount` 为 CP 信号的计数。|
| Answer vote (`project_discussion_answer_votes`) | `answerId`, `voter`, `createdAt` | Answer CP 支持快照，用于限制一人一次。|
| Comment (`project_discussion_comments`) | `id`, `threadId?`, `answerId?`, `parentCommentId?`, `content`, `creator`, `createdAt` | 既可挂在 Thread，也可挂在 Answer。V0 仅返回一层嵌套。|

## tRPC API 一览

### `projectDiscussionThread` router

| 方法 | 输入 | 输出 | 用途 |
| --- | --- | --- | --- |
| `createThread` *(protected)* | `{ projectId: number, title: string, post: string, category?: string[], tags?: string[], isScam?: boolean }` | 新建的 Thread 行 | 创建投诉/Scam Claim。`post` 建议传入富文本 HTML。`category/tags` 会被 `normalizeStringArray` 去重。|
| `listThreads` *(public)* | `{ projectId?: number, category?: string[], tags?: string[], isScam?: boolean, cursor?: number, limit?: number }` | `{ items: Thread[], nextCursor, hasNextPage }`，每个 Thread 携带 `creator` 与 `sentiments` 关系 | 获取线程列表。`projectId` 不传则按创建时间倒序返回全局所有线程，可叠加 `category/tags` 过滤；分页使用 `id` cursor。|
| `getThreadById` *(public)* | `{ threadId: number }` | 单个 Thread，含 `creator` 与 `sentiments` | 详情页基础信息。|

### `projectDiscussionInteraction` router

| 方法 | 输入 | 输出 | 说明 |
| --- | --- | --- | --- |
| `createAnswer` *(protected)* | `{ threadId: number, content: string }` | 新建 Answer | 用于提交讨论解决方案或 Counter Claim。|
| `listAnswers` *(public)* | `{ threadId: number, cursor?: number, limit?: number, sortBy?: 'recent' | 'votes' }` | `{ items: Answer[], nextCursor, hasNextPage }`，Answer 携带 `creator`、`comments`、`sentiments` | Answer 列表。`sortBy='votes'` 会按 `voteCount` 降序。|
| `voteAnswer` / `unvoteAnswer` *(protected)* | `{ answerId: number }` | Updated Answer `{ id, voteCount }` | 记录/撤销 CP 支持。若重复投票会返回 `CONFLICT`。|
| `createComment` *(protected)* | `{ content: string }` 并至少指定 `threadId` / `answerId` / `parentCommentId` | 新建 Comment | V0 前端仅使用 `threadId` 发表讨论。|
| `listComments` *(public)* | `{ threadId? , answerId?, parentCommentId?, cursor?, limit? }` | `{ items: Comment[], nextCursor, hasNextPage }` | 可对 Thread 或 Answer 拉取评论；若指定 `parentCommentId` 会返回该评论与其子节点。|
| `setSentiment` *(protected)* | `{ threadId?: number, answerId?: number, type: string }`（二选一） | Sentiment 行 | 保存/更新情绪投票（重复调用会覆盖 `type`）。|

## 前端集成建议

### 1. 数据获取

- **全局 Discourse**：调用 `listThreads`，不传 `projectId`，按 `createdAt` 倒序展示；`category` 过滤可直接传 Topic 的 value 数组。
- **项目 Complaints Tab**：同样使用 `listThreads`，只需携带 `projectId`。为了实现无感加载，推荐 `useInfiniteQuery` 模式（本次实现的 `useDiscussionThreads` hook 即封装了此逻辑）。
- **线程详情**：
  1. `getThreadById` 获取主贴信息、情绪和作者。
  2. `listAnswers` + 无限滚动展示 Answer。Answer 内置 `comments` 关系，可直接展示一层追问。
  3. `listComments`（只传 `threadId`）渲染 Discussion 区。

### 2. 数据映射

- `ThreadList` 期望的 UI 数据可由 `mapThreadToMeta` 得到：它会将 `post` 富文本裁剪为 `excerpt`，并基于 `sentiments` 计算百分比与 Dominant sentiment。
- 详情页同样复用 `summarizeSentiments` 产出 `{ metrics, totalVotes, dominantKey }`，以驱动 `SentimentIndicator`、`SentimentSelector` 等组件。
- 对 `post` / `content` 字段，前端以 HTML 格式渲染（发布表单已生成 Tiptap HTML）。如需 SEO 友好摘要可调用 `stripHtmlToPlainText`。

### 3. 交互流转

1. **创建线程**
   ```ts
   const mutation = trpc.projectDiscussionThread.createThread.useMutation();
   mutation.mutateAsync({
     projectId,
     title,
     post: html,
     category: [selectedTopicValue],
     tags,
     isScam,
   });
   ```
   创建成功后刷新 `projectDiscussionThread.listThreads`，并跳转到 `/discourse/[id]`。

2. **情绪投票**
   - Thread/Answer 情绪通用 `setSentiment`，若用户重复选择同一项会覆盖旧值。
   - 投票成功后刷新 `getThreadById` 或 `listAnswers`。前端可根据 `sentiments` 中是否包含当前用户的 `creator` 判断默认高亮。

3. **Answer 支持度**
   - “Support” -> `voteAnswer`，成功后刷新 `listAnswers`。
   - “Withdraw” -> `unvoteAnswer`，若用户未曾投票会返回 `NOT_FOUND` 错误，需要通过 toast 告知。

4. **评论/讨论**
   - Thread Discussion：`createComment({ threadId, content })`。
   - Answer 追问：同接口传 `answerId`。
   - 拉取评论建议分页，以免一次性拉取大量历史记录。

### 4. UI 与状态提示

- `DiscoursePageLayout` 统一提供 breadcrumbs + actions + sidebar。本次实现沿用该框架，仅用真实数据填充。
- 列表态加载中、空数据分别以 `border-dashed` 卡片提示；Load More 按钮使用 `hasNextPage`/`isFetchingNextPage` 控制。
- 详情页的 Answer/Discussion 表单增加了最小长度校验 + Mutation Loading 的禁用态，避免重复提交。

### 5. 后续拓展建议

- `projectDiscussionThread.listThreads` 目前仅按时间排序，后续若需要 Top/Status/情绪过滤，可在服务侧增加聚合字段或视图。
- Scam 状态（Alert Displayed/Redressed）与 CP 快照尚未建模，待后端补充后前端可在 `ThreadMetaCard` 中扩展更丰富的状态标签。
- 若需区分 Answer 与 Counter Claim，可在 Answer 行新增 `isCounterClaim` 字段并透传至前端。

## 参考实现

本次提交已经在以下文件中完成首轮对接，可作为参考：

- `components/pages/discourse/useDiscussionThreads.ts`：封装 `useInfiniteQuery`，同时负责映射为 `ThreadMeta`。
- `components/pages/discourse/GlobalDiscoursePage.tsx` / `ProjectComplaintsPage.tsx`：消费上方 hook，提供 Load More 与 Topic 过滤。
- `components/pages/discourse/CreatePostPage.tsx`：挂载项目搜索 + 发布流程，发布成功跳转详情页。
- `components/pages/discourse/ThreadDetailPage.tsx`：基于 `getThreadById`/`listAnswers`/`listComments` 渲染真实详情页，并接入情绪、Answer 支持、评论等核心交互。

如需扩展新视图（Leaderboard、Scam Alerts 等），建议延续相同的 tRPC 调用模式，并在 `threadTransforms` 中集中处理展示层所需的派生数据。
