# 通知系统测试用例说明

## 1. 测试范围概述
- 覆盖通知从生成、入队、派发、前端渲染到用户交互的完整链路。
- 验证不同用户角色（Owner / Creator / Voter / 未关联用户）在不同订阅模式下的通知可见性。
- 检查通知类型（创建、支持、领先/失去领先、通过、奖励等）以及过滤逻辑（自投票过滤、Mute 等）。
- 校验通知队列的定时任务、失败重试与手动触发流程。
- 验证前端组件的状态展示、自动刷新、批量操作等交互。

## 2. 测试环境准备
| 资源 | 说明 |
| --- | --- |
| 账户 | 至少 3 个账号：A=项目 Owner，B=条目 Creator，C=普通 Voter |
| 项目 | 创建 1 个测试项目，确保 B、C 均可访问并进行投票/提交 |
| 队列 | 确保通知队列与 `/api/cron/processNotifications` 可运行（首次可手动触发） |
| 配置 | 设置 `NEXT_PUBLIC_SHOW_NOTIFICATION_CRON=true` 以便前端调试按钮 |

## 3. 功能用例矩阵

### 3.1 通知生成与角色可见性
| 序号 | 触发操作 | 参与角色 | 预期通知 | 关键检查点 |
| --- | --- | --- | --- | --- |
| G1 | A 创建并发布项目 | A | `createProposal` | 文案为 “You created a proposal”，按钮隐藏 |
| G2 | 同步检查 all_events 订阅者 | 其他订阅者 | `createProposal` | 文案显示 `{用户名} created...`，头像展示正确 |
| G3 | B 在项目提交 item proposal | B | `createItemProposal` | “You created a new input”，按钮隐藏 |
| G4 | 同时通知 Owner | A(all_events) | `createItemProposal` | 文案 “{B} created...”，展示头像 |
| G5 | C 为 B 的条目投票 | B | `itemProposalSupported` | Voter 头像 + 名称，文案 “{C} has supported...” |
| G6 | Creator 自己投票 | B | 无通知 | 自投票应被前端过滤，不出现卡片 |
| G7 | 票数导致领先 | B | `itemProposalBecameLeading` | 内容正确，按钮跳转到 Submission |
| G8 | 领先被超越 | B | `itemProposalLostLeading` | 领先丢失通知出现 |
| G9 | 条目通过 | B | `itemProposalPass` | 文案 “has been passed”，按钮维持隐藏 |
| G10 | 提案通过（项目发布） | A/B | `proposalPassed` / `projectPublished` | Owner/Creator 均收到，按钮跳转项目详情 |
| G11 | 项目提案被支持 | B（提案 Creator） | `proposalSupported` | 文案 “{Voter} has supported your proposal”，准确显示投票者信息 |
| G12 | 奖励类通知 | 相关用户 | `createProposal`/`proposalPass`→contributionPoints | 文案 “You have gained contribution points”，按钮隐藏 |

### 3.2 订阅设置
| 序号 | 测试项 | 操作 | 预期结果 |
| --- | --- | --- | --- |
| S1 | Mute All | 用户切换到 `muted`，触发任意通知 | 不应收到任何新通知 |
| S2 | My Contributions | 用户切换到 `my_contributions`，仅在自己参与时触发 | 只在自身创建/投票/拥有的条目上收到通知 |
| S3 | All Events | 切换到 `all_events` | 项目内所有事件均进入通知列表 |
| S4 | 设置切换即时生效 | 多端同时切换，触发新事件 | 后续通知遵循最新模式，无旧数据残留 |

### 3.3 通知队列与定时任务
| 序号 | 场景 | 操作 | 预期 |
| --- | --- | --- | --- |
| Q1 | 手动触发 Cron | 前端点击 “Trigger Cron” | Toast 成功 + 500ms 后自动刷新通知列表 |
| Q2 | 队列失败退避 | 人为制造一次处理失败（如 DB 写入异常），观察 `scheduled_at` | 下一次 `processNotifications` 在退避时间后才重新执行 |
| Q3 | 定时调度 | 检查 `vercel.json` cron（默认 15 分钟） | 即便未手动触发，通知在下个周期被消费 |
| Q4 | 队列清理 | 调用 cron 多次后查看 `notification_queue` | 已完成/失败 >30 天的记录被清理 |

### 3.4 前端交互
| 序号 | 场景 | 操作 | 预期 |
| --- | --- | --- | --- |
| F1 | 列表加载 | 滚动至底部 | 当 `hasNextPage=true` 时触发 `fetchNext*`，Skeleton 展示加载状态 |
| F2 | 手动刷新 | 点击 Trigger Cron → 自动刷新 | `handleManualRefresh` 在 500ms 后 refetch 数据 |
| F3 | 标记已读 | 单击通知卡片或 `Mark all as read` | 未读数量减少，条目变为已读样式 |
| F4 | 批量归档 | 点击 `Archive All` | 所有未读先标记已读后归档，列表刷新无残留 |
| F5 | Actor 展示 | 触发他人创建通知 | 卡片左侧展示 `VoterAvatar`，含头像与名称 |
| F6 | Empty 状态 | 清空 notifications | 列表显示 “No notifications” 占位 |

### 3.5 边界与异常
| 序号 | 场景 | 操作 | 预期 |
| --- | --- | --- | --- |
| E1 | 未登录用户 | 在未认证状态点击通知 | `useNotifications` 不触发请求，提示登录或保持空白 |
| E2 | 数据缺失 | 删去部分 `projectSnaps` 或 `itemProposal.key` | 文案 fallback 至 “project” / 原 key，不崩溃 |
| E3 | 消息重复 | 同一事件多次触发 | 确认不会因缓存导致多数条重复通知 |
| E4 | 多端同步 | 用户在设备1 Muted，设备2 保持 all_events | 触发事件后仅设备2 收到通知 |
| E5 | 归档分页 | 在 Archived tab 中多页加载 | `fetchNextArchivedNotifications` 正常工作，无越界 |
| E6 | 自投票过滤 | 创建者为自己条目投票 | 无 `itemProposalSupported` 通知出现 |
| E7 | Cron 失败提示 | 阻断 cron 请求返回 500 | 前端 toast 显示错误信息，不刷新列表 |

## 4. 实施步骤建议
1. **初始化状态**：清空通知表/归档，确认订阅设置默认值（all_events）。
2. **逐条执行表格用例**，按模块（生成→订阅→队列→前端→边界）推进，记录结果。
3. **多角色交叉验证**：每个关键事件至少在 Creator / Owner / Voter 上验证一次订阅效果。
4. **检查数据库**：重点关注 `notifications.userId`, `voter_id`, `readAt`, `archivedAt` 与 `notification_queue` 状态。
5. **回归测试**：设置全部恢复默认，再执行一次 G1~G11、S1~S3 的快速回归，确保核心流程稳定。

## 5. 验收标准
- 所有用例均通过，且无未解释的额外通知。
- 队列、订阅切换与过滤功能行为符合预期，无重复或缺失。
- 前端交互（刷新、分页、批量操作）无阻塞，文案、头像和时间展示准确。
- 边界情况下系统保持可用，出现错误时有可理解反馈。

完成上述测试后，可对通知系统上线具备足够信心。
