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
| Discussion 体系 | 通用讨论/回复体验（Markdown、情绪开关、草稿、删除恢复）。 |
| Scam 专属能力 | Scam 话题样式、阈值、Counter Claim、OP 撤回、Alert/Redressed 状态。 |

## 3. 用户角色与权限（暂定）
1. **登录用户**：可创建投诉、提交 Answer、发表评论/回复、编辑或删除自己的内容、投出情绪票并为 Answer 贡献 CP。
2. **项目方 / 版主**：具备登录用户权限，可标记 Redressed、突出 Scam Alert、查看/还原被删评论、设定 Scam 阈值。
3. **未登录访客**：只读，尝试互动时提示登录或注册。

## 4. 体验拆解

> **统一情绪投票**：Post、Answer、Comment 三个层级均支持 User Sentiment（Recommend / Agree / Insightful / Provocative / Disagree）投票，结果在列表、侧栏或条目尾部展示，可作为排序过滤条件。  
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
  - `Discussion`（原 Comments）：面向没有明确方案但需要交流的场景，仅展示情绪立场与文本，不支持 CP；与 Answer 的评论区共享排序与过滤。
  - 两个 Tab 共用排序（`Top`、`New`）和 `Sentiment` 过滤；Answer Tab 额外显示 CP 计数条（如“2899 / 9000”）。

### 4.5 Discussion（原 Comments）
- 定位：服务于“想讨论但暂未形成 Answer”的场景，Tab 文案、按钮与空状态全部使用 `Discussion`，避免与 Answer 评论混淆。
- 编辑器：Markdown、4,000 字符、`Discard Draft`/`Publish Post`；右侧保留 `Include Sentiment` 开关，作者可自选是否在 Discussion item 上标注自己对 Topic 的情绪（默认关闭，开启后出现情绪选择器，仅作立场标签，不进入公共统计）。
- 回复体验：在编辑器顶部引用原文，左右分栏（左锁被回复 Answer/Discussion，右为编辑器）；未登录用户显示 `Sign In`。
- 生命周期：允许编辑（显示 `EDITED YYYY/MM/DD`）、删除（显示“COMMENT REMOVED BY THIS USER”，版主可在 “View Original Feed” 查看），并在每条 Discussion 尾部展示情绪图例帮助读者快速理解立场。

### 4.6 Answer & CP 机制
- Answer 是区别于 Discussion 的独立内容层，聚焦“可执行的解决方案 / 反驳”，与状态流转直接挂钩。
- `Staking vs. Signaling`：首页的 `Community Voting` 走 staking/锁仓逻辑（可自定义投入量、需解锁），而 Discourse 里的所有权重都走 signaling（标注态度、不扣减资产）；因此无需链上事务，但必须保留快照凭证。
- Topic/Answer 支持两套权重体系：
  1. **Topic Signaling**：用户点击 `Support this Topic`（或 Scam Claim）时，会以当下账户的全部 CP 作为权重快照；用户不能输入自定义金额，也不会扣减余额。同一用户可以同时标记多个 Topic，亦可随时撤回（撤回后仅删除对应快照，不追补后续 CP 增长），用于 `Top` 排序与 `Alert Displayed` 判定。
  2. **Answer Support**：每位用户在同一个 Topic 上只能选择一个 Answer 进行 CP 支持（避免重复投票）；支持时同样记录快照，不消耗 CP，撤回后可改投其他 Answer。Counter Claim 复用该逻辑用于 `Claim Redressed`。
- **User Sentiment**：Post 与 Answer 提供 Recommend / Agree / Insightful / Provocative / Disagree 五档情绪，作为排序与过滤依据；Discussion 仅可选是否展示作者立场，不参与总数。
- **快照存储**：后端需保存 `user_id / target_id / snapshot_cp / created_at / revoked_at` 等字段，以免实时重新汇总 100+ 投票造成高延迟；`Top`、`Agreed`、`Scam Alert` 等组件依赖该快照表按需聚合。

### 4.7 Request Fresh/Threshold 机制
- `Request Fresh`：当某个 Answer 的支持 CP ≥ `ANSWER_ACCEPTANCE_THRESHOLD`（默认 9,000，环境变量控制，建议按全网 CP 总量的百分比计算）时，视为“社区正式提案”，在 Answers 列表出现高亮框，并在首页 `How to participate` 组件中列出。多个 Answer 可能同时达到阈值，对应 `框内数字` 为达到阈值的条数。
- `Counter Claim Threshold`：Scam 话题下的 Counter Claim 复用同一阈值；任意 Counter Claim ≥ 阈值即触发 `Claim Redressed` 并自动取消项目页的红色 Scheme Alert。
- 阈值调整：更新环境变量后需离线重算所有快照聚合值，并刷新缓存；阈值不按 Topic 单独配置，以避免攻击者通过低阈值刷指标。

## 5. 数据与状态
- 投诉状态：默认、Redressed（已整改）、Unanswered（无有效 Answer）、Scam Alert Displayed（Scam CP 达阈值）、Claim Retracted 等。
- 情绪数据：Post/Answer 全量存储情绪投票用于 `Sentiment` 过滤，Discussion 仅记录作者是否展示立场，不计入全局统计。
- CP 快照：Topic/Answer/Counter Claim 支持都记录 `snapshot_cp` 与 `revoked` 状态，排行榜与阈值计算均走快照，避免实时拉取所有用户余额。
- 后端推荐表：
  - `topic_signal_snapshots(topic_id, user_id, snapshot_cp, created_at, revoked_at)`：Topic 支持偏好，撤回即软删（写入 `revoked_at`）。
  - `answer_support_snapshots(answer_id, user_id, snapshot_cp, created_at, revoked_at)`：Answer/Counter Claim 支持表，需唯一索引 `(answer_id, user_id, revoked_at IS NULL)`。
  - `sentiment_votes(target_type, target_id, user_id, sentiment, created_at)`：Sentiment 统计来源，Discussion 仅在作者开启立场时写一条自定义标识。
  - `threshold_events(target_id, target_type, threshold_type, reached_at)`：缓存“达到阈值”的事件，便于首页/项目页快速渲染。
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
- 评论区同样保留情绪与讨论功能，便于围绕 Scam 证据展开沟通。

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

---
_文档负责人：投诉模块 PM；最后更新：2025-12-04（后续实现阶段请保持同步）。_
