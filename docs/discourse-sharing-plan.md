# Discourse 分享功能实现方案（Thread / Scam / Answer）

## 背景与目标
- 现有 `/project/[id]` 使用 `generateMetadata` 输出 OG/Twitter meta，`/s/[code]` 走 ShareService 生成动态分享卡片。Discourse 线程目前无分享 meta，导致社交平台预览为空。
- 目标：为 Thread、Answer、Scam Alert 三类链接补齐社交分享（OG/Twitter）信息，优先落地 Thread 与 Scam，Answer 其次。

## 现有可复用点
- `app/project/[id]/layout.tsx`：动态 `generateMetadata` 模式可直接复用。
- `app/s/[code]/page.tsx` + `lib/services/share/*`：已有 og:image 生成、canonical、`og:see_also` 等模板，可用作字段参考。
- 数据获取：`app/discourse/[threadId]/page.tsx` 已在服务端用 `appRouter.createCaller` 调 `projectDiscussionThread.getThreadById`，可以在 `generateMetadata` 里复用；阈值常量在 `constants/discourse.ts`。

## 场景与字段
1) Thread 分享（普通/Scam 通用）
   - 路由：`/discourse/[threadId]`
   - 字段：`title`（含项目名可选）、`description`（取帖子的前 160 字）、`openGraph`/`twitter`（title/description/url/image/`card: summary_large_image`），`alternates.canonical`。
   - 图片：优先用项目 logo（thread 查询需返回或可派生项目信息）；无 logo 回退 `/images/default-project.png`。
2) Answer 分享
   - 路由：采用独立路由 `/discourse/[threadId]/answer/[answerId]`（避免 hash 失效爬虫）。
   - 字段：标题可拼接 `Answer · {threadTitle}`；描述截取 Answer 内容；OG/Twitter 同上；canonical 指向 answer 路径。
3) Scam Alert 分享（当 thread.isScam 且 `support >= REDRESSED_SUPPORT_THRESHOLD`）
   - 路由：`/discourse/[threadId]`
   - 标题/描述：突出“Scam Alert”/“Alert Displayed”，带项目名、支持度进度（如“Support 10,200 / 9,000”）；图片沿用项目 logo，缺省回退 `/images/default-project.png`（后续若有专用警示图再替换）。
   - 其余字段与 Thread 一致，需在 meta 中保留 `type: website`。

## 技术方案
1. 公共工具
   - 新增 `lib/services/discourseMeta.ts`（或 `lib/utils/discourseMeta.ts`）：`buildThreadMeta(thread, project, origin)` / `buildAnswerMeta(answer, thread, project, origin)` / `buildScamAlertMeta(thread, project, origin)`。
   - 负责字段裁剪、fallback（缺描述用固定文案，缺图用默认占位），返回 `Metadata`。
2. Thread/Scam meta
   - 在 `app/discourse/[threadId]/page.tsx` 增加 `export async function generateMetadata(...)`。
   - 复用 `createTRPCContext + appRouter.createCaller` 拉取 thread（含 isScam/support/title/post/category/tags/projectId/creator）；补充项目基础信息（name/tagline/logo/categories）用于 meta，推荐在 service 层扩展 thread 查询返回 project summary，或新增轻量 `getProjectSummary(projectId)`，避免重复查询。
   - 判断 Scam Alert 条件：`thread.isScam && thread.support >= REDRESSED_SUPPORT_THRESHOLD` → 调用 `buildScamAlertMeta`，否则走 `buildThreadMeta`。
3. Answer meta
   - 新增路由 `app/discourse/[threadId]/answer/[answerId]/page.tsx`（可直接渲染现有 `ThreadDetailPage` 并滚动到 answer，或先重定向到父路由）。
   - 在该路由的 `generateMetadata` 中通过 tRPC 查询 `getThreadById` + `listDiscussionAnswers`（或新建轻量 `getAnswerById`，仅取 `content`, `support`, `creator`），构造 `buildAnswerMeta`，并带上项目基础信息。
   - 确保 canonical 指向 answer 路径；`og:url` 用当前路径；`og:image` 复用默认。
4. 图片策略
   - 默认使用项目 logo；无 logo 时回退 `/images/default-project.png`。Scam Alert 若未提供专用图也使用项目 logo 回退，后续可切换至分享卡或警示图。
5. 链接与 UI
   - 在 Thread 详情页顶部（或 Share CTA 区）添加分享按钮，链接当前路由；Answer 卡片提供“Share”按钮指向 `/discourse/[threadId]/answer/[answerId]`。
   - Scam Alert 达阈值时，保持按钮分享同一路径即可自动带警示 meta。

## 落地步骤（按优先级）
1) 基础设施：新增 `discourseMeta` 工具（图片回退项目 logo），补线程/项目简要信息的查询能力。
2) Thread/Scam：为 `app/discourse/[threadId]` 增加 `generateMetadata`，输出 OG/Twitter；在详情页放分享按钮。
3) Answer：新增 answer 路由 + meta + 按钮；如需要滚动到 Answer，可在客户端根据 `answerId` 定位。
4) 验证：本地 `pnpm dev` 后用 `curl -I http://localhost:3000/discourse/123` 观察 meta；在 OG Debugger/Twitter Validator 粘贴真实链接核验。为 `discourseMeta` 增加 Vitest 单测覆盖字段拼装与 fallback。
5) 文档/开关：如需按环境开关分享，新增配置项到 `config/` 或 `constants/` 并在 meta 构建中读取；在 PR 描述中附验证截图。

## 开放问题
- 线程查询是否能返回项目名称/logo 以减少额外查询；若不能，需要增加轻量项目摘要接口避免 meta 查询过重。

## 兼容性与风险控制
- 不改动现有 `/project/[id]` 分享逻辑；`discourseMeta` 为新增模块，调用范围仅限 Discourse 路由。
- OG 图片暂用项目 logo，与项目页共用资源，不新增 ShareService 侧行为，避免影响 `/s/[code]` 及项目分享卡片。
- tRPC 查询建议新增轻量字段而非修改现有返回结构；如需扩展返回 project summary，应确保旧调用方字段不变，或新增字段名（例如 `projectSummary`）。
