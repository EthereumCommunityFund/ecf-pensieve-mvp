# 投诉模块 – 初步需求稿

## 1. 背景与目标
- 建立端到端投诉与讨论闭环，覆盖全局社区与单个项目两类场景。
- 通过状态标签、情绪（User Sentiment）与贡献点（Contribution Point，简称 CP）机制提高透明度，辅助诈骗识别与整改追踪。
- 以结构化数据（分类、标签、CP、情绪、状态）沉淀治理指标，为后续产品与风控决策提供依据。

## 2. 范围概览
| 交付物 | 描述 |
| --- | --- |
| 全局 Discourse 页 | 顶部导航新增 `Discourse` 入口，聚合所有投诉话题与筛选能力。 |
| 项目级 Complaints Tab | `project/[id]` 页面新增 `Complaints` 标签，承载项目内投诉、诈骗提醒与排行榜。 |
| 投诉创建流程 | 含表单、CP 校验、诈骗开关和预览能力。 |
| 投诉话题详情 | 以 Tab 区分 Answer 与 Comment，展示 CP、情绪分布、状态与参与指引。 |
| Discussion 体系 | 通用讨论/回复体验（Markdown、草稿、删除恢复）。 |
| Scam 专属能力 | Scam 话题样式、阈值、Counter Claim、OP 撤回、Alert/Redressed 状态。 |

## 3. 用户角色与权限（暂定）
1. **登录用户**：可创建投诉、提交 Answer、发表评论/回复、编辑或删除自己的内容、投出情绪票并为 Answer 贡献 CP。
2. **项目方 / 版主**：具备登录用户权限，可标记 Redressed、突出 Scam Alert、查看/还原被删评论、设定 Scam 阈值。
3. **未登录访客**：只读，尝试互动时提示登录或注册。

## 4. 体验拆解

> **统一情绪投票**：Thread 与 Answer 支持 User Sentiment（Recommend / Agree / Insightful / Provocative / Disagree）投票并参与排序/过滤，Comment/Discussion 暂不采集情绪票，仅展示文本。  
> **命名统一**：统一使用 `Topic/Thread`（主贴）、`Answer`（结构化回答/Counter Claim）、`Discussion`（原 Comments）三层称谓，避免 Campaign / Post / Thread 等混称。  
> **情绪投票入口**：首页与列表上的情绪组件仅展示统计，真实投票需进入 Topic 详情弹窗，确保用户阅读后再表达立场。

### 4.1 全局 Discourse 页面
- 导航：`Topbar → Discourse`，面包屑 `Back / Discourse / Crumb`。
- 顶部介绍区：标题、描述、`Create a Thread` / `Leaderboard` 按钮。
- 列表筛选：
  - 状态 Tab：`All`、`Redressed`、`Unanswered`。
  - 排序 Chips：`Top`、`New`，并提供 `Sentiment` 过滤（Recommend / Agree / Insightful / Provocative / Disagree）。
  - 右侧工具栏：`Search Threads` 搜索、`Create a Thread` 快捷按钮、`Topics` 过滤（12 个预设分类，可多选并清空）。
- `Top` 排序：后端依据 `topic_signal_snapshots` 汇总出的 CP 权重排序，需定期增量同步至缓存以避免每次请求全表扫描。
- 话题卡片：`Complaint Topic` 徽章 + 状态标签、标题与可选摘要、作者头像/昵称/相对时间、互动数据（投票/评论数）、情绪指示条。

### 4.2 项目级 Complaints Tab
- 入口：`project/[id] → Complaints`，面包屑 `ProjectName / Complaints`。
- Header 包含项目概览、`Complaints`/`Redressed` 计数、`Create a Thread`、`Leaderboard`、`View Scam Alerts`。
- 列表布局与全局一致，但数据 scoped 到项目；排序额外支持 `Agreed`（按共识度排序）。
- 右侧工具栏复用全局 Topics 过滤。

### 4.3 投诉创建流程
- 入口：全局或项目页 `Create a Thread`；项目上下文会影响默认分类与统计。
- 表单字段：
  - `Title`（40 字符提示）。
  - `Post`（Markdown，4,000 字符）。
  - `Category`（下拉 + Autocomplete，含 Scam & Fraud Concerns 等）。
  - `Post as Scam Alert?` 开关：开启后走 Scam 流程（详见第 8 节），并展示 CP 要求与状态提示。
  - `Tags`：多选/自定义标签，采用 Autocomplete。
- 操作：`Preview Post`、`Discard Draft`、`Publish Post`。预览界面模拟最终话题（徽章、标签、投票、情绪、CTA 全量呈现）。
- 内容锁定：V0 发布后的 Topic／Scam Claim／Counter Claim 禁止编辑，仅允许删除或撤回；未来若要开放编辑需配合版本历史与票数重算方案。

### 4.4 投诉话题详情
- 顶部：面包屑、类型徽章（普通或 Scam）、标题、作者、时间、编辑状态（V0 默认锁定，后续版本再暴露 `Edited` 标记）。
- 正文：Markdown 渲染，支持嵌入链接/证据、标签列表、补充指标（浏览、分享）。
- 参与控件：
  - 主按钮 `Answer This Question`，辅助按钮 `Post Comment`。
  - 情绪投票条展示上述五类情绪的百分比。
  - 情绪投票须阅读：情绪按钮只在详情页/弹窗中激活，列表或首页仅展示统计，避免用户未阅读即投票。
  - 分享、收藏等社交操作位预留。
- 侧栏组件：`Contribution Point Votes`（显示 CP 票数、阈值描述）、`User Sentiment for this post`（柱状分布）、`How to participate`（解释支持/反对路径与权限）、`Update Post`、`Answer Complaint` 等快捷入口。
- 页面主体以 Tab 划分两个维度：
  - `Answers`（普通投诉）或 `Counter Claims`（Scam 场景）：结构化回答，支持 CP 投票与情绪投票，支持内嵌评论树。
  - `Discussion`（原 Comments）：面向没有明确方案但需要交流的场景，仅展示文本，不支持 CP 或情绪投票；与 Answer 的评论区共享排序与过滤。
  - 两个 Tab 共用排序（`Top`、`New`）和 `Sentiment` 过滤；Answer Tab 额外显示 CP 计数条（如“2899 / 9000”）。

### 4.5 Discussion（原 Comments）
- 定位：服务于“想讨论但暂未形成 Answer”的场景，Tab 文案、按钮与空状态全部使用 `Discussion`，避免与 Answer 评论混淆。
  - 编辑器：Markdown、4,000 字符、`Discard Draft`/`Publish Post`；当前仅支持文本讨论，不提供情绪选择或立场标记。
- 回复体验：在编辑器顶部引用原文，左右分栏（左锁被回复 Answer/Discussion，右为编辑器）；未登录用户显示 `Sign In`。
- 生命周期：允许编辑（显示 `EDITED YYYY/MM/DD`）、删除（显示“COMMENT REMOVED BY THIS USER”，版主可在 “View Original Feed” 查看），当前不再展示情绪图例，保持纯文本讨论。

### 4.6 Answer & CP 机制
- Answer 是区别于 Discussion 的独立内容层，聚焦“可执行的解决方案 / 反驳”，与状态流转直接挂钩。
- CP 信号：所有投票都走 signaling，不扣减资产；投票时取当前用户 `profiles.weight` 作为快照写入 `project_discussion_votes`（Thread）或 `project_discussion_answer_votes`（Answer），撤回时用快照权重回滚。
- Thread（含 Scam Claim/Counter Claim）投票：一次投满当前 CP，累加到 `thread.support`，供 `sortBy=votes` 和 Scam Alert 判定使用。Scam thread 超过阈值显示橙色 Alert，任一 Counter Claim 过阈值或 OP 撤回主张时视为 redressed。
- Answer 投票：每个用户对单个 Answer 限一票；`support` 达到阈值（`REDRESSED_SUPPORT_THRESHOLD = 9000`）即视为正式解答，可同时存在多个。跨越阈值会增减 `thread.redressedAnswerCount`，驱动列表 Tab `redressed`。
- **User Sentiment**：仅 Thread/Answer 提供 Recommend / Agree / Insightful / Provocative / Disagree，重复提交会覆盖；Discussion 不记录情绪。
- **快照存储**：支持表保存 `weight` 与时间戳，撤票用快照回退，避免依赖用户最新 CP；情绪单独存于 `project_discussion_sentiments`。

### 4.7 Request Fresh/Threshold 机制
- 采纳阈值：当前服务端常量 `REDRESSED_SUPPORT_THRESHOLD = 9000`，Answer/Counter Claim 支持从 ≤ 阈值升至 > 阈值视为通过，降回阈值以下则撤销通过状态。
- Scam Alert 阈值：Scam Thread 超过同一阈值时前端展示橙色 Alert；若有 Counter Claim 达阈值或 OP 撤回，Alert 转为 redressed/撤回态。
- 阈值调整：目前写死在服务层，调整需修改代码并重算聚合；后续如改为配置需同步前端提示文案与进度条计算。

## 5. 数据与状态
- 投诉状态：默认、Redressed（已整改）、Unanswered（无有效 Answer）、Scam Alert Displayed（Scam CP 达阈值）、Claim Retracted 等。
- 情绪数据：Thread/Answer 全量存储情绪投票用于 `Sentiment` 过滤，Discussion 不记录情绪或立场。
- CP 快照：Thread/Answer 支持都记录权重快照，撤回时按快照回滚，避免实时拉取用户最新 CP。
- 后端表：
  - `project_discussion_votes(thread_id, voter, weight, created_at)`：Thread 支持快照，唯一约束 thread+voter。
  - `project_discussion_answer_votes(answer_id, voter, weight, thread_id, created_at)`：Answer/Counter Claim 支持快照，服务层限制一人一票。
  - `project_discussion_sentiments(thread_id?, answer_id?, creator, type, created_at)`：Thread/Answer 情绪记录，重复写会覆盖。
- Withdraw 逻辑：所有支持类操作都允许撤回；撤回后需要同步更新聚合表/缓存，并允许用户立即改投其它 Answer。
- CP 数据：Answer 级积分、Scam 阈值、Counter Claim 支持度、OP CP 余额等。
- Scam 标记：与 `View Scam Alerts` 列表和项目级告警按钮联动。
- 项目指标：投诉与 Redressed 数、有效 Answer 数、Scam 告警数、贡献者排行榜。
- 内容编辑策略：Topic/Scam Claim/Counter Claim V0 仅支持撤回或删除，不开放编辑；Discussion/Answer 评论可编辑且展示历史标记。

## 6. 成功指标
- 项目页显示 Complaints / Redressed 计数。
- Leaderboard 以 CP、被采纳 Answer、Scam 处置等维度排序。
- 话题侧栏实时展示情绪分布与 CP 进度，帮助运营监控健康度。

## 7. 未决问题 / 下一步
1. Redressed 与 Scam 状态的设定权限（项目方、版主、系统自动）需细化。
2. 情绪与 CP 数据是否需要链上/数据库审计追溯，是否支持撤销。
3. `Leaderboard` 是全局与项目双模式还是单一列表，API/缓存策略待定。
4. 通知策略：新投诉、新 Answer、Scam 阈值达到、Counter Claim 成功等场景如何提醒。
5. Topics 与 Tags 的数据源是否与现有常量文件共享，避免重复维护。
6. Project 页面现有 Tab 过多导致 SEO/性能受限，是否需要将 Complaints/Discourse 独立为专用路由或静态化入口。
7. CP 防刷策略与阈值动态：需结合真实 Token 发行或对“创建项目获得 CP”做折扣，防止刷分用户影响权重。
8. Topic/Answer/Counter Claim 长期编辑方案：若未来开放编辑，需设计评分重算与历史版本展示，避免投票被“换题”。
9. 作者是否可以为自己的 Topic/Answer 投 CP、是否默认计入一次支持仍需产品确认，以免数据失真。

## 8. Scam 专属流程

### 8.1 创建校验（`codex-clipboard-fkq1mq.png`）
- 当选择 `Scam & Fraud Concerns` 或开启 Scam 开关时展示 CP 要求（例如“CP Requirement to post: 0000 CP”）。
- 若作者当前 CP 不足，则禁用发布按钮并提示补足 CP。

### 8.2 Scam 话题样式与状态（`codex-clipboard-4KoRSY.png`、`codex-clipboard-OOe1tk.png`、`codex-clipboard-gY9ZDv.png`）
- 列表与详情使用 `⚠️ Scam & Fraud` 徽章。
- 状态徽章：
  - `Alert Displayed on Page`：CP 支持达到 Scam Acceptance Threshold，项目页显示醒目警示按钮。
  - `Claim Redressed`：问题已解决或被反驳，徽章变为绿色。
- 详情页主按钮变为 `Support This Claim` + 进度条，辅助按钮重命名为 `Counter This Claim` 或 `Retract Your Claim`（OP 可见）。

### 8.3 Counter Claim（`codex-clipboard-7r7QxT.png`）
- 任何用户可创建 Counter Claim（本质为 Answer）。Counter Claim 有独立 Tab，并显示 CP 进度（如 “2899 / 9000”）。
- Counter Claim 也可被评论、被投情绪。

### 8.4 状态流转
- **Scam Accepted / Alert Displayed**：主张的 CP 支持 ≥ `Scam Acceptance Threshold`（侧栏显示 CP 总数与阈值）。
- **Claim Redressed**：满足其一：项目方标记已解决；某个 Counter Claim CP ≥ 阈值；或 OP 撤销主张。
- Counter Claim 覆盖：一旦任意 Counter Claim 达阈值，需立即撤下项目页 `Scheme Alert`，并在话题顶部展示“Counter Claim accepted”提示，即使原主张仍保留高 CP。
- **Claim Retracted**（`codex-clipboard-YvGyse.png`）：OP 点击 `Retract Your Claim`，状态更新并记录时间戳，Counter Claim 列表保留以供审阅。

### 8.5 参与提示
- 侧栏 `How to participate` 分为 “Support Main Claim” 与 “Counter Claim” 两部分，引导用户分别投 CP 或创建/支持反主张（参考 `codex-clipboard-OOe1tk.png` 和 `codex-clipboard-gY9ZDv.png`）。
- 评论区同样保留讨论功能，便于围绕 Scam 证据展开沟通。

## 9. 业务逻辑与状态流转

### 9.1 普通投诉流
1. **创建投诉**：用户填写表单（Title/Post/Category/Tags）。若未选择 Scam，则走普通流。
2. **内容展示**：话题上架后进入全局或项目列表，默认状态为 `Open`。所有用户可在 Answers Tab 提交解决方案，也可在 Comments Tab 讨论。
3. **Answer 投票**：
   - User Sentiment：影响排序与情绪统计。
   - CP Upvote：用于衡量回答质量。高 CP(高于系统设定的阈值) 的 Answer 会被认定为【官方答案】。
4. **Rectify / Redress**：
   - 当项目方给出官方回复或 OP 接受某 Answer，可将话题标记为 `Redressed`
   - 若长时间无有效 Answer，可落入 `Unanswered`（列表 Tab 供筛选）。
5. **关闭/归档**：当话题被标记为 Redressed 或手动关闭时，进入已解决状态；仍可浏览历史 Comments/Answers。

### 9.2 Scam 投诉流
1. **创建与 CP 校验**：选择 `Scam & Fraud Concerns` 或开启 Scam 开关后，系统校验 CP 足额才允许发布。
2. **初始状态**：话题为 `Scam Claim (Open)`，页面展示 `Support This Claim` 按钮与 `Counter This Claim` CTA。
3. **支持主张**：
   - 用户可消耗 CP 支持原主张；CP 累加，显示在进度条和侧栏 `Contribution Point Votes`。
   - 当 CP ≥ `Scam Acceptance Threshold` 时，状态变更为 `Alert Displayed on Page`，项目页出现告警。
4. **反驳主张**：
   - 任何用户可创建 Counter Claim（Answer 类型），同样需要社区 CP 支持。
   - Counter Claim Tab 展示所有反主张及进度；可被评论和投情绪。
   - 当某个 Counter Claim 的 CP ≥ 阈值时，系统将主话题状态设为 `Claim Redressed`，并提示“反主张成立”。
5. **OP 撤回**：
   - OP 可在任意阶段点击 `Retract Your Claim`。状态转为 `Claim Retracted`，但保留历史记录与 Counter Claim 进度。
6. **状态矩阵**：
   | 状态 | 触发条件 | 备注 |
   | --- | --- | --- |
   | Scam Claim (Open) | 新建且未达阈值 | 仍可继续支持或反驳 |
   | Alert Displayed on Page | 支持 CP ≥ Scam Acceptance Threshold | 在项目页显示警示按钮 |
   | Claim Redressed | 项目方确认、Counter Claim 达阈值或 OP 撤销后官方确认 | 徽章变为绿色 |
   | Claim Retracted | OP 主动撤回 | 侧栏提示撤回时间与原因 |
   | Counter Claim Supported | 某个 Counter Claim CP 达阈值 | 通常伴随 Claim Redressed |

### 9.3 状态一致性与展示
- 列表页、项目页、话题详情以及通知系统需要共享同一状态源，确保状态徽章一致显示。
- Tab 状态（All/Redressed/Unanswered）只针对普通投诉；Scam Alert 与 Counter Claim 通过额外标签展示，但也可被包含在 All 中。
- 情绪数据与 CP 指标在状态切换后仍保留，以便后续审计。

## 10. 投票逻辑与前端对接（当前实现）

### 10.1 数据字段与判定
- Thread：`support` 为累积 CP 快照，用于 `sortBy=votes`；Scam Alert 进度可按 `support / REDRESSED_SUPPORT_THRESHOLD` 计算。
- Answer：`support` 记录支持度，`viewerHasSupported` 提示当前用户是否已投；跨阈值会更新 `thread.redressedAnswerCount`，供 Tab=`redressed` 使用。
- Sentiments：仅 Thread/Answer 存在，Comment 不采集。前端按 `project_discussion_sentiments` 聚合展示百分比/排行。
- 列表筛选：`listThreads` 支持 `tab=all/redressed/unanswered` 与 `sortBy=recent/votes`；`listAnswers` 同样支持 `sortBy=recent/votes`。
- 阈值：当前写死在 `lib/services/projectDiscussionInteractionService.ts` 的 `REDRESSED_SUPPORT_THRESHOLD = 9000`，前端 Alert/采纳判定需与之保持一致。

### 10.2 API 调用流程（tRPC）
1. 加载详情：`projectDiscussionThread.getThreadById` → `projectDiscussionInteraction.listAnswers({ threadId, sortBy })`（内置 `viewerHasSupported`）→ `projectDiscussionInteraction.listComments({ threadId })`。
2. Thread CP 投票：`projectDiscussionThread.voteThread({ threadId })` / `projectDiscussionThread.unvoteThread({ threadId })`；成功后刷新 `getThreadById`/`listThreads`，Scam 话题据 `support` 与阈值渲染 Alert/Redressed。
3. Answer CP 投票：根据 `viewerHasSupported` 控制按钮态；`projectDiscussionInteraction.voteAnswer` / `projectDiscussionInteraction.unvoteAnswer` 后刷新 `listAnswers`，必要时刷新 `listThreads` 以同步 `redressedAnswerCount`。
4. 情绪投票：`projectDiscussionInteraction.setSentiment({ threadId, type })` 或 `{ answerId, type }`；重复调用会覆盖，刷新对应查询更新 UI。
5. 评论：`projectDiscussionInteraction.createComment` / `projectDiscussionInteraction.listComments`（传 `threadId` 或 `answerId`）；无需情绪字段。

### 10.3 UI 行为要点
- “一次投完当前 CP”：按钮直接用当前 `profiles.weight` 作为权重快照，不扣减项目 CP，前端无需输入数值。
- “票数排行”：线程/回答的 `votes` 排序对应 `support` 字段；情绪排行需前端按 sentiments 聚合。
- Scam 场景：`support ≥ 阈值` 显示橙色 Alert；若 `redressedAnswerCount > 0` 或 OP 撤回则显示 Redressed/Counter Claim 通过状态。
- 一人一票：Thread 层有唯一索引限制重复投票；Answer 层服务已阻止同一用户在同一 Thread 支持多个 Answer（需先 `unvoteAnswer` 再改投），但表层暂无唯一约束并发保护。

---
_文档负责人：投诉模块 PM；最后更新：2025-12-05（后续实现阶段请保持同步）。_
