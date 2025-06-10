# Penseive BE PRD
#web3/ecf

## 系统概述

本系统旨在提供一个项目提案、投票和日志跟踪的平台。用户可以创建项目，为项目提交提案（包含多个信息项的整体提案或针对特定信息项的子提案）。其他用户可以对这些提案进行投票。系统会根据投票结果、预设规则（如权重、法定数量）来更新项目状态、记录项目变更历史，并对相关用户进行激励（如更新权重、发送奖励通知）。

核心流程围绕以下几个概念：

**1. 项目 (Project)**：用户创建的核心实体，包含众多描述性信息。项目有一个发布状态（isPublished），从未发布到发布需要满足一定条件。

**2. 提案 (Proposal)**：针对一个项目的整体性修改建议，包含项目所有核心字段的拟定值。

**3. 子提案/条目提案 (ItemProposal)**：针对项目中某一个具体字段（如项目名称、网址等）的修改建议。

**4. 投票 (VoteRecord)**：用户对提案或条目提案中的具体条目进行投票，投票时会附带用户的当前权重。

**5. 项目日志 (ProjectLog)**：记录项目中各个条目的"领先提案"变更历史。当一个条目提案获得足够的票数支持，成为该条目当前的"最佳"版本时，会记录在此。

**6. 用户权重 (Profile Weight)**：用户在系统中的影响力，会根据其行为（如创建提案、提案通过等）进行更新。

**7. 活动日志 (ActiveLog)**：记录用户在系统中的各项操作。

**8. 通知 (Notification)**：当特定事件发生时（如提案通过、获得奖励），向用户发送通知。

## 数据库表关系概述

（基于 lib/db/schema/ 和 lib/db/schema/relations.ts）

* **profiles (用户)**
  * 与 auth.users 关联 (Supabase 用户认证)。
  * 一个用户可以创建多个 projects。
  * 一个用户可以创建多个 proposals。
  * 一个用户可以创建多个 itemProposals。
  * 一个用户可以有多个 voteRecords。
  * 一个用户可以收到多个 notifications。
  * 一个用户可以有多个 activeLogs (作为操作者 userId 或提案创建者 proposalCreatorId)。
  * 可以关联一个 invitationCodes (邀请码)。

* **projects (项目)**
  * 属于一个 profiles (创建者)。
  * 一个项目可以有多个 proposals。
  * 一个项目可以有多个 itemProposals。
  * 一个项目可以有多个 projectLogs。
  * 一个项目可以有多个 voteRecords (通过 projectId 字段直接关联，也通过 proposalId 或 itemProposalId 间接关联)。
  * 一个项目可以有多个 likeRecords。
  * 项目包含 itemsTopWeight (JSONB)，记录各可提案条目的当前最高总票重。

* **proposals (提案)**
  * 属于一个 projects。
  * 属于一个 profiles (创建者)。
  * 一个提案可以有多个 voteRecords。
  * 一个提案可以关联多个 notifications。

* **itemProposals (条目提案)**
  * 属于一个 projects。
  * 属于一个 profiles (创建者)。
  * 一个条目提案可以有多个 voteRecords。
  * 一个条目提案可以关联多个 notifications (通过 notifications.itemProposalId)。

* **voteRecords (投票记录)**
  * 属于一个 profiles (投票者)。
  * 属于一个 projects (通过 projectId 直接关联)。
  * **可选地**属于一个 proposals (如果投票针对的是整体提案中的条目)。
  * **可选地**属于一个 itemProposals (如果投票针对的是某个具体的条目提案)。

* **projectLogs (项目日志/领先提案记录)**
  * 属于一个 projects。
  * **可选地**关联一个 proposals (如果项目初次发布时，记录的是初始提案)。
  * **可选地**关联一个 itemProposals (如果记录的是某个条目的领先子提案)。

* **notifications (通知)**
  * 属于一个 profiles (接收者)。
  * **可选地**关联一个 projects。
  * **可选地**关联一个 proposals。
  * **可选地**关联一个 itemProposals。

* **activeLogs (活动日志)**
  * 属于一个 profiles (操作者 userId)。
  * **可选地**属于一个 projects。
  * **可选地**关联一个 profiles (提案创建者 proposalCreatorId)。

* **likeRecords (点赞记录)**
  * 属于一个 projects。
  * 属于一个 profiles (点赞者)。

## 常量

(lib/constants.ts 和 lib/pocItems.ts)：

* POC_ITEMS: 定义了项目中所有可提案条目 (Proof of Concept items) 的元数据，包括是否为 isEssential (核心条目) 和 accountability_metric (问责指标，用于计算权重和奖励)。
* WEIGHT: 基础权重单位 (10)。
* REWARD_PERCENT: 奖励百分比 (0.2，即20%)。
* QUORUM_AMOUNT: 法定票数 (3)。
* ESSENTIAL_ITEM_WEIGHT_AMOUNT: 所有核心条目问责指标总和乘以基础权重单位。
* ESSENTIAL_ITEM_LIST, ESSENTIAL_ITEM_AMOUNT, ESSENTIAL_ITEM_WEIGHT_SUM: 从 POC_ITEMS 派生出的核心条目列表、数量和总权重等。

## 业务逻辑与接口详情 (PRD)

### 1. Project (项目) Router (lib/trpc/routers/project.ts)

#### 1.1 createProject (创建项目)

* **权限**: 认证用户 (protectedProcedure)
* **用途**: 允许认证用户创建一个新的项目，并自动为其创建一个包含所有项目初始值的提案。
* **输入参数 (input)**:
  * name: string (项目名称, 必填, 非空)
  * tagline: string (项目标语, 必填, 非空)
  * categories: string[] (项目分类数组, 必填, 至少一项)
  * mainDescription: string (主要描述, 必填, 非空)
  * logoUrl: string (Logo链接, 必填, 非空)
  * websites: string (网站链接, 必填, 非空)
  * appUrl?: string (应用链接, 可选)
  * dateFounded: Date (成立日期, 必填)
  * dateLaunch?: Date (上线日期, 可选)
  * devStatus: string (开发状态, 必填, 非空)
  * fundingStatus?: string (融资状态, 可选)
  * openSource: boolean (是否开源, 必填)
  * codeRepo?: string (代码仓库链接, 可选)
  * tokenContract?: string (代币合约地址, 可选)
  * orgStructure: string (组织架构, 必填, 非空)
  * publicGoods: boolean (是否为公共物品, 必填)
  * founders: { name: string; title: string }[] (创始人信息数组, 必填, 至少一项)
  * tags: string[] (标签数组, 必填, 至少一项)
  * whitePaper: string (白皮书链接/内容, 必填, 非空)
  * dappSmartContracts: string (DApp智能合约信息, 必填, 非空)
  * refs?: { key: string; value: string }[] (参考链接数组, 可选)

* **核心业务逻辑**:
  1. **事务处理**:整个创建过程包裹在数据库事务中，确保原子性。
  2. **创建项目记录**: 在 projects 表中插入一条新记录，creator 为当前用户ID。
  3. **更新用户权重**: 调用 updateUserWeight 服务，为项目创建者增加权重。增加的权重值为 ESSENTIAL_ITEM_WEIGHT_AMOUNT * REWARD_PERCENT。
     * ESSENTIAL_ITEM_WEIGHT_AMOUNT 是所有核心条目问责指标总和乘以 WEIGHT (10)。
  4. **创建初始提案 (隐藏调用)**:
     * 内部调用 proposalRouter.createProposal 方法。
     * 将 input 中的所有字段 (除了 refs) 转换为提案条目 ({ key, value } 格式)。
     * 使用这些条目和 refs (如果提供) 为新创建的项目 projectId 创建一个初始提案。
  5. **发送奖励通知**: 调用 addRewardNotification 服务，使用 createRewardNotification.createProposal 生成通知数据，通知用户项目创建成功并获得了权重奖励。

* **返回数据**:
  * 类型: projects.$inferSelect (Drizzle ORM 推断的项目表记录类型)
  * 内容: 成功创建的项目对象。

* **错误处理**:
  * 如果项目记录创建失败，抛出 TRPCError (NOT_FOUND, 'project not found') (理论上插入后立刻返回，此错误较少见)。
  * 如果后续的提案创建、权重更新或通知发送失败，事务将回滚，并抛出 TRPCError (INTERNAL_SERVER_ERROR, 'Failed to create the project and its initial proposal. All changes have been rolled back.')。

#### 1.2 getProjects (获取项目列表)

* **权限**: 公开 (publicProcedure)
* **用途**: 获取项目列表，支持分页和根据发布状态筛选。
* **输入参数 (input)**: 可选对象
  * limit?: number (每页数量, 1-100, 默认50)
  * cursor?: number (分页游标, 上一页最后一个项目的ID)
  * isPublished?: boolean (是否已发布, 默认 false)

* **核心业务逻辑**:
  1. 根据 isPublished 和 cursor 构建查询条件。
  2. **条件性数据获取**:
     * 如果 isPublished 为 false (获取未发布项目)，则 with 选项会包含项目的 proposals，以及提案的 voteRecords 和投票者 creator 信息。这是因为未发布项目通常处于提案和投票阶段。
     * 如果 isPublished 为 true，则只包含项目创建者 creator 信息。
  3. 查询 projects 表，并同时查询符合条件的总项目数。
  4. 确定下一页的 nextCursor。

* **返回数据**: 对象
  * items: ProjectWithDetails[] (项目对象数组，具体类型根据 isPublished 而定，包含关联数据)
    * ProjectWithDetails 包含 projects.$inferSelect 的所有字段。
    * 如果 !isPublished，还包含 proposals 数组，每个 proposal 包含 voteRecords (含投票者信息)和提案创建者信息。
  * nextCursor?: number (下一页的游标)
  * totalCount: number (符合筛选条件的总项目数)

#### 1.3 getProjectById (根据ID获取项目详情)

* **权限**: 公开 (publicProcedure)
* **用途**: 获取单个项目的详细信息。
* **输入参数 (input)**:
  * id: number (项目ID, 必填)

* **核心业务逻辑**:
  1. 查询 projects 表中指定ID的项目。
  2. with 选项包含项目创建者 creator 和所有关联的 proposals。
  3. 每个 proposal 会进一步包含其所有的 voteRecords，每个 voteRecord 包含投票者 creator 信息。

* **返回数据**:
  * 类型: ProjectWithDetails (与 getProjects 中未发布项目详情类似)
  * 内容: 包含创建者、所有提案（提案中含投票记录及投票人信息）的项目对象。

* **错误处理**:
  * 如果未找到项目，抛出 TRPCError (NOT_FOUND, 'Project not found')。

#### 1.4 scanPendingProject (扫描待处理项目并尝试发布)

* **权限**: 公开 (publicProcedure) - *设计说明：此接口通常由定时任务（Cron Job）调用，用于自动处理满足发布条件的未发布项目。*
* **用途**: 扫描所有未发布的项目，检查它们是否满足发布条件。如果满足，则将项目标记为已发布，并执行一系列后续操作。
* **输入参数**: 无

* **核心业务逻辑**:
  1. **复杂SQL查询**:
     * 定义核心条目配置 (pocItemsConfig)：从 POC_ITEMS 中筛选出 isEssential: true 的条目及其 accountability_metric * WEIGHT 作为 required_weight。
     * 构建 CTE (Common Table Expressions):
       * poc_config: 将核心条目配置转换为 SQL 可用的值。
       * project_proposal_votes: 聚合每个项目、每个提案、每个核心条目 (vote_key) 的投票者数量 (key_voters) 和总权重 (key_weight)。
       * valid_projects: 从 project_proposal_votes 中筛选出那些所有核心条目都满足以下条件的提案：
         * 投票者数量 (key_voters) >= QUORUM_AMOUNT (法定票数)。
         * 总权重 (key_weight) > required_weight (该条目要求的权重)。
         * 并且，满足上述条件的条目数量等于 ESSENTIAL_ITEM_AMOUNT (核心条目总数)。
       * 最终查询 valid_projects 获取所有符合发布条件的项目的 project_id, proposal_id, proposal_creator, 和提案 items。
  2. **事务处理**: 对每个符合条件的项目的处理都在一个独立的数据库事务中进行。
  3. **处理每个符合条件的项目**:
     * 获取该项目初始提案的所有投票记录 (projectVoteRecords)。
     * 计算 itemsTopWeight: 一个记录每个条目当前最高总票权重的对象，基于初始提案的投票结果。
     * **更新项目状态**:
       * 将 projects.isPublished 设置为 true。
       * 将计算出的 itemsTopWeight 更新到 projects.itemsTopWeight。
     * **创建项目日志**: 在 projectLogs 表中插入一条记录，关联 projectId 和初始 proposalId，标记该提案为项目的首个"领先"版本。
     * **迁移提案条目和投票 (关键步骤)**:
       * 获取初始提案 (originalProposal) 的所有条目 (item.key, item.value) 和参考链接 (refs)。
       * 对于初始提案中的每个条目：
         * 在 itemProposals 表中为该条目创建一个新的子提案记录，关联到当前 projectId，创建者为初始提案的创建者，并附带相应的 ref。
         * 记录新创建的 itemProposal.id 到 itemProposalMap (以 item.key 为键)。
       * 对于初始提案的每条投票记录 (voteRecord)：
         * 使用 itemProposalMap 中对应 voteRecord.key 的 itemProposalId，在 voteRecords 表中为新创建的子提案复制一条投票记录（保留原投票者、权重和项目ID）。
         * *这实质上是将对整体提案中条目的投票，转化为对独立的、新创建的条目提案的投票。*
     * **更新初始提案创建者权重**: 调用 updateUserWeight，为初始提案的创建者 proposalCreator 增加权重。增加的权重值为 ESSENTIAL_ITEM_WEIGHT_AMOUNT * (1 - REWARD_PERCENT)。
       * *注意这里的乘数是 (1 - REWARD_PERCENT)，因为创建者在项目创建时已获得 REWARD_PERCENT 的奖励。*
     * **发送奖励通知**: 调用 addRewardNotification，使用 createRewardNotification.proposalPass 通知初始提案创建者其提案已通过，并获得了相应的权重奖励。
  4. 计数成功处理的项目数量。

* **返回数据**: 对象
  * success: boolean (操作是否成功，即使没有项目被处理也可能为 true)
  * processedCount: number (成功处理并发布的项目数量)
  * message: string (操作结果的描述信息)

* **错误处理**:
  * 如果任何一个项目的处理过程中发生错误，该项目的事务会回滚，但不会影响其他项目的处理。错误会被捕获并记录到控制台。
  * 如果整个扫描过程发生严重错误（如数据库连接问题），会抛出 TRPCError (INTERNAL_SERVER_ERROR, 'Failed to scan pending projects')。

### 2. Proposal (提案) Router (lib/trpc/routers/proposal.ts)

#### 2.1 createProposal (创建提案)

* **权限**: 认证用户 (protectedProcedure)
* **用途**: 为指定项目创建一个新的整体提案。
* **输入参数 (input)**:
  * projectId: number (关联的项目ID, 必填)
  * items: { key: string; value: any }[] (提案条目数组, key为项目字段名, value为建议值, 必填)
  * refs?: { key: string; value: string }[] (参考链接数组, 可选)

* **核心业务逻辑**:
  1. **校验项目存在性**: 查询 projects 表确保 projectId 对应的项目存在。
  2. **获取用户资料**: 查询当前用户的 profiles 以获取其 weight。
  3. **创建提案记录**: 在 proposals 表中插入新提案，creator 为当前用户ID。
  4. **自动为提案者投票 (隐藏逻辑)**:
     * 对于 input.items 中的每一个条目 (item):
       * 在 voteRecords 表中为当前提案 (proposal.id) 和该条目 (item.key) 创建一条投票记录。
       * 投票者 (creator) 为当前用户ID。
       * 投票权重 (weight) 使用当前用户的 userProfile?.weight ?? 0。
       * 记录相关的 projectId。
     * **记录活动日志**: 为每条自动创建的投票记录调用 logUserActivity.vote.create。
  5. **记录提案创建活动**: 调用 logUserActivity.proposal.create 记录提案创建事件。

* **返回数据**:
  * 类型: proposals.$inferSelect
  * 内容: 成功创建的提案对象。

* **错误处理**:
  * 如果项目未找到，抛出 TRPCError (NOT_FOUND, 'Project not found')。
  * 如果提案记录创建失败，抛出 TRPCError (NOT_FOUND, 'Proposal not found') (理论上插入后立刻返回，此错误较少见)。

#### 2.2 getProposalsByProjectId (根据项目ID获取提案列表)

* **权限**: 公开 (publicProcedure)
* **用途**: 获取指定项目下的所有提案。
* **输入参数 (input)**:
  * projectId: number (项目ID, 必填)

* **核心业务逻辑**:
  1. 查询 proposals 表，筛选条件为 projectId。
  2. with 选项包含提案创建者 creator 的信息。

* **返回数据**:
  * 类型: Array<ProposalWithCreator> (其中 ProposalWithCreator 包含 proposals.$inferSelect 和关联的 creator: profiles.$inferSelect)
  * 内容: 提案对象数组，每个提案对象包含创建者信息。

#### 2.3 getProposalById (根据ID获取提案详情)

* **权限**: 公开 (publicProcedure)
* **用途**: 获取单个提案的详细信息。
* **输入参数 (input)**:
  * id: number (提案ID, 必填)

* **核心业务逻辑**:
  1. 查询 proposals 表，筛选条件为 id。
  2. with 选项包含提案创建者 creator 的信息。

* **返回数据**:
  * 类型: ProposalWithCreator
  * 内容: 单个提案对象，包含创建者信息。

* **错误处理**:
  * 如果未找到提案，抛出 TRPCError (NOT_FOUND, 'Proposal not found')。

### 3. ItemProposal (条目提案/子提案) Router (lib/trpc/routers/itemProposal.ts)

#### 3.1 createItemProposal (创建条目提案)

* **权限**: 认证用户 (protectedProcedure)
* **用途**: 允许用户为特定项目的某个具体条目（如名称、网站等）提出修改建议。
* **输入参数 (input)**:
  * projectId: number (关联的项目ID, 必填)
  * key: string (提案针对的项目条目字段名, 必填, 非空)
  * value: any (建议的新值)
  * ref?: string (参考链接, 可选)
  * reason?: string (提案理由, 可选)

* **核心业务逻辑**:
  1. **事务处理**: 整个创建过程包裹在数据库事务中。
  2. **校验项目存在性**: 查询 projects 表确保 projectId 对应的项目存在。
  3. **创建条目提案记录**: 在 itemProposals 表中插入新记录，creator 为当前用户ID。
  4. **获取用户资料和现有投票/提案信息**:
     * 查询当前用户的 profiles (userProfile)。
     * 查询该项目下是否已存在针对同一 key 的其他条目提案 (existingProposal)。
     * 查询当前用户是否已对该项目的该 key 投过票 (voteRecord)。
  5. **判断是否为核心条目**: 调用 isEssentialItem(input.key) (基于 ESSENTIAL_ITEM_LIST)。
  6. **条件化处理 (奖励与投票)**:
     * **条件**: 如果 !existingProposal (即这是该项目该 key 的第一个条目提案) 且 !isEssential (不是核心条目)。
     * **计算奖励**: 调用 calculateReward(input.key)，奖励值为 POC_ITEMS[key].accountability_metric * WEIGHT * REWARD_PERCENT。
     * **更新用户权重**: 使用上述奖励值更新创建者 (ctx.user.id) 的权重。
     * **发送奖励通知**: 调用 addRewardNotification (使用 createRewardNotification.createItemProposal)。
     * **处理投票记录**: 调用 handleVoteRecord (工具函数，详见 utils 部分)。
     * userId: 当前用户。
     * weight: 使用用户*更新后*的权重 (finalWeight)。
     * existingVoteRecord: 传入之前查询到的 voteRecord。
     * **记录活动日志**: 调用 logUserActivity.itemProposal.create。
     * **其他情况**: (已存在同 key 提案，或是核心条目)
     * **处理投票记录**: 调用 handleVoteRecord。
     * weight: 使用用户*当前*的权重 (userProfile?.weight ?? 0)。
     * **记录活动日志**: 调用 logUserActivity.itemProposal.update (此处用 update 可能是因为用户可能在切换对此 key 的投票，或者此 key 已有提案存在)。

* **返回数据**:
  * 类型: itemProposals.$inferSelect
  * 内容: 成功创建的条目提案对象。

* **错误处理**:
  * 如果项目未找到，抛出 TRPCError (NOT_FOUND, 'Project not found')。
  * 如果条目提案记录创建失败，抛出 TRPCError (INTERNAL_SERVER_ERROR, 'Failed to create item proposal')。
  * handleVoteRecord 或其他内部调用可能抛出其自身的错误。

### 4. Vote (投票) Router (lib/trpc/routers/vote.ts)

#### 4.1 createVote (为整体提案中的条目投票)

* **权限**: 认证用户 (protectedProcedure)
* **用途**: 允许用户对一个未发布项目的整体提案中的特定条目进行投票。
* **输入参数 (input)**:
  * proposalId: number (提案ID, 必填)
  * key: string (投票针对的提案条目字段名, 必填, 非空)

* **核心业务逻辑**:
  1. **获取提案、项目及用户信息**: 查询目标提案及其关联的项目，当前用户的资料，以及用户是否已对该提案的该 key 投过票 (existingVote)。
  2. **校验**:
     * 提案和关联项目必须存在。
     * 项目必须未发布 (!project.isPublished)。
     * 用户不能重复对同一提案的同一 key 投票 (existingVote)。
     * 用户不能对同一项目的同一 key 在不同提案中投票 (otherVote)。如果已在其他提案中对该 key 投票，则需使用 switchVote。
  3. **创建投票记录**: 在 voteRecords 表中插入新记录。
     * key, proposalId, creator (当前用户ID)。
     * weight: 使用用户当前的 userProfile?.weight ?? 0。
     * projectId: 从提案关联的项目中获取。
  4. **记录活动日志**: 调用 logUserActivity.vote.create。

* **返回数据**:
  * 类型: voteRecords.$inferSelect
  * 内容: 成功创建的投票记录对象。

* **错误处理**:
  * 各种 TRPCError (NOT_FOUND, FORBIDDEN, BAD_REQUEST)，对应上述校验失败的情况。

#### 4.2 switchVote (切换整体提案中条目的投票)

* **权限**: 认证用户 (protectedProcedure)
* **用途**: 允许用户将其在某个项目中对特定 key 的投票，从一个提案切换到另一个提案。
* **输入参数 (input)**:
  * proposalId: number (目标新提案ID, 必填)
  * key: string (投票针对的提案条目字段名, 必填, 非空)

* **核心业务逻辑**:
  1. **获取目标提案及项目信息**: 查询目标提案 targetProposal 及其关联项目。
  2. **校验目标提案**: 目标提案和项目必须存在，项目必须未发布。
  3. **获取用户资料和待切换的投票**:
     * 查询当前用户的 profiles (userProfile)。
     * 查询用户在同一 projectId 下对同一 key 的现有投票 (voteToSwitch)。
  4. **校验待切换的投票**:
     * voteToSwitch 必须存在。
     * 用户不能从自己的提案切换投票 (voteToSwitch.proposal.creator === ctx.user.id)。
     * 不能切换到已投票的提案 (voteToSwitch.proposalId === proposalId)。
  5. **更新投票记录**: 更新 voteToSwitch 记录的 proposalId 为新的目标 proposalId，并更新 weight 为用户当前权重。
  6. **记录活动日志**: 调用 logUserActivity.vote.update。

* **返回数据**:
  * 类型: voteRecords.$inferSelect
  * 内容: 成功更新的投票记录对象。

* **错误处理**:
  * 各种 TRPCError (NOT_FOUND, FORBIDDEN, BAD_REQUEST)。

#### 4.3 cancelVote (取消对整体提案中条目的投票)

* **权限**: 认证用户 (protectedProcedure)
* **用途**: 允许用户取消其对某个整体提案中特定条目的投票。
* **输入参数 (input)**:
  * id: number (要取消的投票记录ID, 必填)

* **核心业务逻辑**:
  1. **获取投票记录详情**: 查询指定ID的投票记录，并包含其关联的提案和项目信息。
  2. **校验**:
     * 投票记录及其关联的提案和项目必须存在。
     * 投票记录必须属于当前用户 (eq(voteRecords.creator, ctx.user.id))。
     * 用户不能取消对自己创建提案的投票 (voteWithDetails.proposal.creator === ctx.user.id)。
     * 项目必须未发布。
  3. **删除投票记录**: 从 voteRecords 表中删除该记录。
  4. **记录活动日志**: 调用 logUserActivity.vote.delete。

* **返回数据**:
  * 类型: voteRecords.$inferSelect
  * 内容: 被删除的投票记录对象。

* **错误处理**:
  * TRPCError (NOT_FOUND, FORBIDDEN)。

#### 4.4 getVotesByProposalId (获取投票列表)

* **权限**: 公开 (publicProcedure)
* **用途**: 分别根据提案ID或项目ID获取相关的投票记录列表。
* **输入参数**:
  * getVotesByProposalId: { proposalId: number }
  * getVotesByProjectId: { projectId: number }

* **核心业务逻辑**:
  1. 查询 voteRecords 表，根据输入条件筛选。
  2. with 选项包含投票者 creator 的信息。

* **返回数据**:
  * 类型: Array<VoteWithCreator> (其中 VoteWithCreator 包含 voteRecords.$inferSelect 和关联的 creator: profiles.$inferSelect)
  * 内容: 投票记录对象数组，每个对象包含投票者信息。

#### 4.5 createItemProposalVote (为条目提案投票)

* **权限**: 认证用户 (protectedProcedure)
* **用途**: 允许用户对一个特定的条目提案进行投票。这是针对已发布项目或非核心条目的主要投票方式。
* **输入参数 (input)**:
  * itemProposalId: number (条目提案ID, 必填)
  * key: string (投票针对的条目字段名, 必填, 非空) - *冗余信息，itemProposal本身就有key，但接口设计如此*

* **核心业务逻辑**:
  1. **事务处理**: 整个过程在事务中进行。
  2. **获取条目提案和用户信息**: 查询目标 itemProposal (含创建者) 和当前用户的 profile。
  3. **校验条目提案**: 必须存在。
  4. **检查现有投票**: 查询用户是否已对该 projectId 的该 key 投过票 (existingVote)。如果存在，则不允许重复投票。
  5. **处理/创建投票记录**: 调用 handleVoteRecord 工具函数。
     * userId: 当前用户。
     * projectId: 从 itemProposal 获取。
     * itemProposalId: 输入的 itemProposalId。
     * key: 输入的 key。
     * weight: 用户当前的 userProfile?.weight ?? 0。
     * proposalCreatorId: itemProposal.creator.userId。
  6. **获取相关数据**: 查询与此投票相关的项目所有投票 (votes)、项目本身 (project)、以及该 key 当前的领先项目日志 (projectLog)。
  7. **条件化更新/处理结果**:
     * **情况一**: 如果当前投票的 itemProposalId 已经是该 key 的领先提案 (projectLog?.itemProposalId === itemProposalId)：
       * 调用 processItemProposalUpdate：仅更新项目的 itemsTopWeight 中该 key 的总权重。
     * **情况二**: 投票的不是当前领先提案 (或尚无领先提案)：
       * 调用 checkNeedQuorum: 判断是否需要进行法定人数检查（如果该 key 是非核心条目且之前没有领先提案，则需要）。
       * 调用 processItemProposalVoteResult:
         * 如果需要法定人数检查且票数未达到 QUORUM_AMOUNT，则不执行任何操作。
       * 计算此 itemProposal 对该 key 的当前总票重 (voteSum)。
       * 与 project.itemsTopWeight[key] (或0) 比较。
       * 如果 voteSum 更高：
         * 此 itemProposal 成为新的领先提案。
         * 计算并给予 itemProposal.creator 奖励 (调用 calculateReward, updateUserWeight, addRewardNotification.itemProposalPass)。奖励金额根据是否需要 needCheckQuorum 会有所调整 (如果跳过检查，奖励会少一个 REWARD_PERCENT)。
         * 更新/插入 projectLogs，将此 itemProposal 标记为新的领先者 (isNotLeading: false)。
         * 更新 projects.itemsTopWeight[key] 为新的 voteSum。
  8. **返回数据**:
     * 类型: voteRecords.$inferSelect
     * 内容: 成功创建/更新的投票记录对象。
  9. **错误处理**:
     * TRPCError (NOT_FOUND, BAD_REQUEST)。
     * 内部调用的 processItemProposalVoteResult 等函数中的错误。

#### 4.6 switchItemProposalVote (切换条目提案的投票)

* **权限**: 认证用户 (protectedProcedure)
* **用途**: 允许用户将其对项目中特定 key 的投票从一个条目提案切换到另一个条目提案。
* **输入参数 (input)**:
  * itemProposalId: number (目标新条目提案ID, 必填)
  * key: string (投票针对的条目字段名, 必填, 非空)

* **核心业务逻辑**:
  1. **事务处理**。
  2. **获取目标条目提案和用户信息**。
  3. **校验目标条目提案**: 必须存在。
  4. **查找用户现有投票**: 查询用户在同一 projectId 对同一 key 的现有投票 (voteToSwitch)。
  5. **校验现有投票**:
     * voteToSwitch 必须存在。
     * 不能切换到自己已投的 itemProposalId。
  6. 记录被切换掉的原始条目提案ID (originalItemProposalId = voteToSwitch.itemProposalId)。
  7. **更新投票记录**: 更新 voteToSwitch 记录的 itemProposalId 为新的目标 itemProposalId，将 proposalId 置为 null，并更新 weight。
  8. **获取相关数据**: 与 createItemProposalVote 类似，获取更新后的选票、项目信息、当前领先日志。
  9. **条件化更新/处理结果 (与 createItemProposalVote 逻辑类似)**:
     * 如果新投的 itemProposalId 已是领先者，则调用 processItemProposalUpdate。
     * 否则，调用 checkNeedQuorum 和 processItemProposalVoteResult 来判断新提案是否能成为领先者，并处理奖励和日志。
  10. **处理原领先提案 (如果发生切换)**: 如果 originalItemProposalId (被切换掉的提案) 之前是领先者，调用 handleOriginalProposalUpdate：
       * 重新计算 originalItemProposalId 的总票重。
       * 如果其总票重不再是最高的，则将其在 projectLogs 中的记录标记为 isNotLeading: true。
  11. **记录活动日志**: 调用 logUserActivity.vote.update。

* **返回数据**:
  * 类型: voteRecords.$inferSelect
  * 内容: 成功更新的投票记录对象。

* **错误处理**:
  * TRPCError (NOT_FOUND, BAD_REQUEST)。

### 5. ProjectLog (项目日志/领先提案记录) Router (lib/trpc/routers/projectLog.ts)

#### 5.1 getLeadingProposalsByProjectId (获取项目所有条目的当前领先提案)

* **权限**: 公开 (publicProcedure)
* **用途**: 获取指定项目下，其所有可提案条目 (key) 当前的领先提案信息。
* **输入参数 (input)**:
  * projectId: number (项目ID, 必填)

* **核心业务逻辑**:
  1. 使用 SQL ROW_NUMBER() OVER (PARTITION BY key ORDER BY createdAt DESC) 子查询 (latestLogsSubquery):
     * 从 projectLogs 中按 key 分组，并按创建时间降序排列，为每个 key 的最新一条记录（即当前领先记录）标记 rn = 1。
     * 筛选条件为 projectId。
  2. 主查询从 latestLogsSubquery 中选择 rn = 1 的记录。
  3. LEFT JOIN 关联 itemProposals 表 (通过 itemProposalId) 和 profiles 表 (通过 itemProposals.creator)，以获取领先条目提案的详情及其创建者信息。

* **返回数据**: 数组，每个元素对象包含：
  * id: string (projectLog ID)
  * projectId: number
  * key: string (项目条目字段名)
  * proposalId: number | null (关联的整体提案ID，通常只在项目初次发布时有值)
  * itemProposalId: number | null (关联的条目提案ID)
  * createdAt: Date (此日志记录的创建时间)
  * itemProposal: ItemProposalWithCreator | null (如果有关联的条目提案，则包含其详细信息和创建者信息)
    * ItemProposalWithCreator 包含 itemProposals.$inferSelect 的所有字段，以及 creator: profiles.$inferSelect | null。

* **数据结构说明**: 返回的是 projectLogs 的记录，但"扁平化"并嵌入了关联的 itemProposal 和 creator 数据。

#### 5.2 getProposalsByProjectIdAndKey (获取项目特定条目的领先提案及所有相关条目提案)

* **权限**: 公开 (publicProcedure)
* **用途**: 获取指定项目下特定条目 (key) 的当前领先提案，以及所有与该 key 相关的条目提案列表。
* **输入参数 (input)**:
  * projectId: number (项目ID, 必填)
  * key: string (项目条目字段名, 必填)

* **核心业务逻辑**:
  1. **并行查询**:
     * 查询 projectLogs 获取该 projectId 和 key 的最新一条记录 (leadingProposal)，并附带关联的 itemProposal (含投票记录和创建者)。
     * 查询 itemProposals 获取该 projectId 和 key 的所有条目提案 (allItemProposals)，并附带每个提案的投票记录和创建者。

* **返回数据**: 对象
  * leadingProposal: ProjectLogWithDetails | null
    * ProjectLogWithDetails 包含 projectLogs.$inferSelect 的字段，以及 itemProposal (包含 voteRecords 和 creator)。
  * allItemProposals: Array<ItemProposalWithVotesAndCreator>
    * ItemProposalWithVotesAndCreator 包含 itemProposals.$inferSelect 的字段，以及 voteRecords 数组和 creator 对象。

* **数据结构说明**: leadingProposal 是单个对象或null，allItemProposals 是一个数组。

#### 5.3 getLeadingProposalHistoryByProjectIdAndKey (获取项目特定条目的领先提案历史)

* **权限**: 公开 (publicProcedure)
* **用途**: 获取指定项目下特定条目 (key) 的所有历史领先提案记录（即 projectLogs 表中所有与该 projectId 和 key 相关的记录）。
* **输入参数 (input)**:
  * projectId: number (项目ID, 必填)
  * key: string (项目条目字段名, 必填)

* **核心业务逻辑**:
  1. 查询 projectLogs 表，筛选条件为 projectId 和 key。
  2. with 选项包含关联的 itemProposal (含投票记录和创建者)。
  3. 按 createdAt 降序排列，展示最新的历史记录在前。

* **返回数据**:
  * 类型: Array<ProjectLogWithDetails> (与 getProposalsByProjectIdAndKey 中的 leadingProposal 结构类似，但这里是数组)
  * 内容: 指定条目的所有历史领先提案日志记录数组。

### 工具函数逻辑 (来自lib/utils/itemProposalUtils.ts)
这些函数在 itemProposalRouter 和 voteRouter 中被大量调用，是理解其复杂投票和奖励机制的关键。

1. **calculateReward(key: string): number**
   * 根据 POC_ITEMS[key].accountability_metric * WEIGHT * REWARD_PERCENT 计算奖励值。

2. **isEssentialItem(key: string): boolean**
   * 检查 key 是否在 ESSENTIAL_ITEM_LIST 中。

3. **handleVoteRecord(...)**
   * **用途**: 创建或更新用户的投票记录。
   * **逻辑**:
     * 如果 existingVoteRecord 不存在:
       * 在 voteRecords 表中插入新投票。
       * 记录 logUserActivity.vote.create。
     * 如果 existingVoteRecord 存在:
       * 更新该投票记录的 weight 和 itemProposalId (用于切换投票目标)。
       * 记录 logUserActivity.vote.update。
   * 返回创建或更新后的投票记录。

4. **checkNeedQuorum(tx: any, { projectId, key })**
   * **用途**: 判断对某个条目的提案投票时是否需要检查法定人数。
   * **逻辑**:
     * 如果条目是核心条目 (ESSENTIAL_ITEM_LIST)，则**不需要**法定人数检查 (返回 false)。
     * 否则，查询 projectLogs 看该 projectId 和 key 是否已有领先提案 (hasLeadingProposal)。
     * 如果**没有**领先提案，则**需要**法定人数检查 (返回 true)。
     * 如果**已有**领先提案，则**不需要** (返回 false)。

5. **processItemProposalVoteResult(...)**
   * **用途**: 在用户对条目提案投票后，处理投票结果，判断是否产生新的领先提案，并执行相应操作（奖励、更新日志等）。
   * **输入**: 事务对象 tx, 某条目提案的所有选票 votes, 条目提案对象 itemProposal, 项目对象 project, 条目 key, 是否需要检查法定人数 needCheckQuorum, 操作用户 userId。
   * **逻辑**:
     1. 如果 needCheckQuorum 为 true 且 votes.length < QUORUM_AMOUNT，则直接返回 (未达到法定人数)。
     2. 计算当前 itemProposal 对该 key 的总票重 voteSum。
     3. 获取项目当前记录的该 key 的最高票重 keyWeight (从 project.itemsTopWeight[key])。
     **4** **如果** **voteSum > keyWeight**:
       * 此 itemProposal 成为新的领先提案。
       * 计算奖励 reward：POC_ITEMS[key].accountability_metric * WEIGHT * rewardMultiplier。
         * rewardMultiplier：如果 !needCheckQuorum (即无需检查法定人数，可能是因为这是核心条目或已有领先者被超越)，则 rewardMultiplier = 1。否则（即之前无领先者且满足了法定人数），rewardMultiplier = 1 - REWARD_PERCENT (因为20%的奖励可能在创建时或之前已被某种形式给予，这里只给剩余的)。
       * 计算提案创建者的新总权重 finalWeight。
       * **检查** **projectLogs** **中是否已存在此** **itemProposal** **的记录** **oldLog** (通常在用户修改投票权重导致其重新成为领先时发生)。
         * 如果 oldLog 存在: 更新该 projectLogs 的 isNotLeading = false 和 createdAt，并更新 projects.itemsTopWeight。然后返回。
       * **如果** **oldLog** **不存在 (通常是首次成为领先)**:
         * 在 projectLogs 插入新记录，标记此 itemProposal 为该 key 的领先者。
         * 更新 projects.itemsTopWeight[key] 为 voteSum。
         * 更新 itemProposal.creator 的用户权重 (profiles.weight = finalWeight)。
         * 发送奖励通知 (addRewardNotification 使用 createRewardNotification.itemProposalPass) 给 itemProposal.creator。
       * 返回 { reward, finalWeight, voteSum }。
     5. 如果 voteSum <= keyWeight，返回 null (未成为新的领先提案)。

6. **processItemProposalUpdate(...)**
   * **用途**: 当对一个已经是领先的条目提案进行投票（通常是修改权重或有更多人投票）时，只更新项目的 itemsTopWeight。
   * **逻辑**:
     * 计算总票重 voteSum。
     * 更新 projects.itemsTopWeight[key] 为 voteSum。

7. **handleOriginalProposalUpdate(...)**
   * **用途**: 当用户将其投票从一个条目提案 (originalItemProposalId) 切换到另一个时，此函数被调用来检查并可能更新 originalItemProposalId 的领先状态。
   * **输入**: 事务对象 tx, 被切换掉的条目提案ID originalItemProposalId, 项目ID projectId, 条目 key, 项目对象 project。
   * **逻辑**:
     1. 查找 projectLogs 中与 projectId 和 key 相关的当前领先记录 originalLeadingCheck。
     **2** **如果** **originalLeadingCheck?.itemProposalId === originalItemProposalId** (即被切换的提案原本是领先的):
       * 重新获取 originalItemProposalId 的所有投票记录 (originalVotes)。
       * 计算其新的总票重 originalVoteSum。
       * 获取项目当前记录的该 key 的最高票重 keyWeight (从 project.itemsTopWeight[key])。
       * **如果** **originalVoteSum < keyWeight** (即它不再是票数最高的了，因为当前用户的票已移走):
         * 将 originalLeadingCheck 这条 projectLogs 记录的 isNotLeading 设为 true。

## 核心业务流程串联解释

### 1. 项目的诞生与初步定型 (未发布阶段)

* **发起 (projectRouter.createProject)**:
  * 一切始于用户通过 createProject 接口提交一个新项目的完整设想。这包括名称、描述、Logo、网站等所有在 projects 表中定义的基础字段。
  * **关键点**: 系统不仅仅是保存这个项目信息。它会**立即**为此项目创建一个**初始的"完整提案"** (proposals 表记录)。这个提案实际上复制了所有刚刚输入的项目数据。
  * **自动投票**: 项目创建者也会自动用其当前的"权重" (profiles.weight) 为这个初始完整提案的每个条目 (key)"投票"。这些投票记录保存在 voteRecords 表中。
  * **激励**: 项目创建者会因为创建项目及其初始提案而获得权重增加的奖励。
  * 此时项目处于未发布状态 (isPublished = false)。

* **社区反馈与竞争提案 (未发布阶段)**:
  * 其他用户可以查看此项目及其初始提案。
  * **为初始提案投票**: 他们可以使用 voteRouter.createVote 为初始完整提案中的特定条目 (key) 投票。他们的选票（及其权重）也会记录在 voteRecords 表中。
  * **创建替代的完整提案**: 如果用户认为他们对项目的整体构想更好，也可以通过 proposalRouter.createProposal 为同一项目创建一个全新的"完整提案"。这类替代提案的创建者同样会自动为其提案的所有条目投票。
  * 用户可以使用 voteRouter.switchVote 在不同完整提案之间（针对相同的 key）切换他们的选票，或者使用 voteRouter.cancelVote 取消选票。

### 2. 项目的"官方认证"与发布 (关键转折点)

* **自动扫描与验证 (projectRouter.scanPendingProject)**:
  * 这个操作（很可能是自动化的）会定期检查所有**未发布**的项目。
  * **发布条件**: 项目（通过其某个完整提案，通常是初始提案）必须满足其所有**核心（essential）要素**（在 POC_ITEMS 中定义）的特定标准：
    * 每个核心要素都达到了投票人数的法定数量 (QUORUM_AMOUNT)。
    * 每个核心要素的总投票权重超过了其 required_weight。
    * 这些条件必须在同一个完整提案的框架内为**所有**核心要素满足。
  * **发布时的操作**:
    * projects.isPublished 设置为 true。
    * projects.itemsTopWeight (JSONB 字段)被填充：对于每个 key，记录它在"胜出"的完整提案中获得的总投票权重。这成为将来比较 itemProposals 的基准。
    * 在 projectLogs 中创建一条记录，将项目与"胜出"的完整提案的 proposalId 关联起来。这意味着该提案的所有条目现在都是"领先的"。
    * **最重要的步骤 – 转化**: "胜出"的完整提案中的每个条目（key 和 value）都**转化**为一个单独的 itemProposal 记录。之前为这些条目投的票（在完整提案的背景下）也会被**复制**，并现在与对应的新 itemProposalId 相关联。这就为已发布项目的细化更改奠定了基础。
    * "胜出"的完整提案的创建者会获得额外的奖励（权重增加）。

### 3. 已发布项目的迭代改进

* 项目一旦发布，创建"完整"提案的功能可能会被禁用或不再适用。主要的更改机制现在是 itemProposals（针对特定条目的提案）。

* **创建 itemProposal (itemProposalRouter.createItemProposal)**:
  * 用户可以针对已发布项目的特定属性 (key) 提出更改建议（例如，新的 tagline）。
  * **奖励主动性**: 如果这是针对**非核心要素**的第一个提案，并且之前没有其他关于此 key 的提案，那么 itemProposal 的创建者会获得少量奖励（权重增加）。
  * itemProposal 的创建者会自动用其当前（或刚刚增加的）权重为自己的提案投票。

* **为 itemProposal 投票 (voteRouter.createItemProposalVote, voteRouter.switchItemProposalVote)**:
  * 其他用户对这些特定的 itemProposals 进行投票。
  * **检查现有投票**: 用户不能在同一个 projectId 内为同一个 key 投票超过一次（如果他们已经为该 key 的另一个 itemProposal 投过票，他们必须使用 switchItemProposalVote）。
  * **确定"领先"状态 (核心逻辑位于 itemProposalUtils.ts, 由 voteRouter 调用)**:
    1. **是否需要法定人数? (checkNeedQuorum)**:
       * 如果 key 是"核心要素" (isEssentialItem)，则不需要法定人数。
       * 如果对于此 key 已经在 projectLogs 中有记录（即已经有一个"领先者"），则不需要法定人数。
       * 否则（非核心要素且当前没有领先者），则需要达到法定人数 (QUORUM_AMOUNT)。
    2. **处理投票结果 (processItemProposalVoteResult)**:
       * 如果需要法定人数但未达到（对当前 itemProposal 的投票数 < QUORUM_AMOUNT），则领先状态不会改变。
       * 否则，计算当前（正在投票的）itemProposal 的总投票权重 (voteSum)。
       * 将此 voteSum 与 projects.itemsTopWeight[key]（当前该 key 领先者的权重）进行比较。
       * **如果 voteSum > projects.itemsTopWeight[key] (当前的 itemProposal 获得了更多的选票)**:
         * 这个 itemProposal 成为该 key 的新领先者。
         * 此 itemProposal 的创建者将获得奖励（权重增加，发送通知）。
         * 在 projectLogs 中会创建新记录或更新现有记录（针对此 itemProposalId），将其标记为领先 (isNotLeading = false)。
         * 如果之前有另一个 itemProposal 是领先者，其在 projectLogs 中的记录将被标记为 isNotLeading = true（这通过 handleOriginalProposalUpdate 在切换投票时处理）。
         * projects.itemsTopWeight[key] 更新为新的 voteSum。
       * **如果 voteSum <= projects.itemsTopWeight[key]**: 领先者不变。但如果投票是针对已经是领先者的提案，则其 voteSum（以及相应的 projects.itemsTopWeight[key]）会通过 processItemProposalUpdate 更新。

### 4. 获取投票信息和"领先提案"信息

这部分逻辑主要由 voteRouter（部分接口）和 projectLogRouter 提供支持，允许前端和用户清晰地了解当前项目的状态、各个提案的受欢迎程度以及特定项目属性的演变历史。

* **拉取投票记录 (voteRouter.getVotesByProposalId / getVotesByProjectId)**:
  * **业务目的**: 提供透明度，让所有用户都能看到针对某个"完整提案"或整个项目的所有投票情况。
  * **调用逻辑**: 前端在展示一个"完整提案"的详情时，会调用 getVotesByProposalId 来列出所有针对该提案各个条目 (key) 的投票。如果需要展示一个项目（尤其是在未发布阶段）所有相关的投票，可能会调用 getVotesByProjectId。
  * **数据说明**: 返回的是投票记录列表，每条记录都包含了投票人 (creator) 的基本信息（如用户名、头像）和他们的投票权重。这样可以清晰地看到每个条目获得了哪些用户的支持以及支持的"力度"。

* **查看项目当前各属性的"领先者" (projectLogRouter.getLeadingProposalsByProjectId)**:
  * **业务目的**: 对于一个已发布的项目，用户需要快速了解项目中每个可配置属性（如项目名称、官网链接、白皮书等）当前采纳的是哪个版本（即哪个 itemProposal 的提议胜出）。
  * **调用逻辑**: 当用户进入一个已发布项目的详情页时，前端会调用此接口。它会返回该项目下每一个 key（项目属性）当前"领先"的 itemProposal（或项目发布时的初始 proposal 条目）。
  * **"领先"的判断**: "领先"是通过查询 projectLogs 表中每个 key 最新的一条且 isNotLeading = false 的记录来确定的。这条记录会关联到具体的 itemProposal。
  * **数据说明**: 返回一个列表，其中每个元素代表项目的一个属性 (key) 及其当前领先的 itemProposal 的详细信息（包括提案内容、创建者信息）。这构成了项目当前在所有可配置属性上的"官方版本"。

* **查看特定属性的"领先者"与"竞争者" (projectLogRouter.getProposalsByProjectIdAndKey)**:
  * **业务目的**: 当用户想深入了解项目中某一个特定属性（例如"项目简介"）的当前采纳版本以及其他所有针对该属性的提议时使用。
  * **调用逻辑**: 前端在展示项目特定属性的编辑/提案区域，或者当用户点击某个属性以查看其详情和备选方案时，会调用此接口。
  * **数据说明**: 返回一个对象，包含两部分：
    * leadingProposal: 当前领先的 projectLog 记录，及其关联的 itemProposal 的完整信息（包括投票记录和创建者）。
    * allItemProposals: 一个数组，包含了所有针对此 projectId 和 key 提交过的 itemProposals（无论是否领先），同样包含每个提案的投票记录和创建者信息。
    * 这样用户既能看到当前采纳的版本，也能看到其他历史或当前的备选方案及其受欢迎程度。

* **查看特定属性的"领先者"变更历史 (projectLogRouter.getLeadingProposalHistoryByProjectIdAndKey)**:
  * **业务目的**: 提供项目特定属性（key）的完整演变历史，让用户了解该属性的定义是如何随着时间的推移、通过哪些提案的胜出而改变的。
  * **调用逻辑**: 当用户需要追溯某个项目属性（如"发展路线图"）是如何一步步形成当前版本时，前端会调用此接口。
  * **数据说明**: 返回一个 projectLogs 记录的数组，这些记录都与指定的 projectId 和 key 相关，并按创建时间降序排列。每条记录都代表了在某个时间点上，哪个 itemProposal 的提议成为了该属性的"领先者"。通过这个列表，可以清晰地看到历史上的每一个"领先版本"及其提出者。

### 核心业务逻辑要点:

* **两阶段提案系统**: 首先是"完整"提案，用于项目的形成和发布；然后是"细化的" itemProposals，用于已发布项目的迭代改进。
* **自动化**: 提案创建者自动为其提案投票；项目在满足条件时自动发布。
* **权重与声誉**: 投票具有权重，该权重取决于用户的声誉 (profiles.weight)。成功的行为（例如创建成为领先者的提案）会增加用户的权重。
* **激励机制**: 对创建项目和成功的提案（包括完整提案和 itemProposals）给予奖励。
* **透明度**: 所有更改和投票的历史记录都会被跟踪，并且可以被查询。
* **itemsTopWeight 和 projectLogs**: 这是确定和跟踪项目各元素"领先"版本的两个主要机制。itemsTopWeight 用于快速确定当前的最大权重，而 projectLogs 用于记录历史和明确指示领先者。
* **责任分离**: itemProposalUtils.ts 文件封装了复杂的奖励计算、法定人数检查和领先状态更新逻辑，使得路由代码更清晰。

### 总结:

这组接口共同构成了一个强大的查询系统，使得用户可以：

1. 了解任何提案（无论是"完整提案"还是针对具体条目的"子提案"）获得了多少支持，支持来自哪些用户，以及这些用户的权重如何。
2. 快速掌握一个已发布项目当前所有属性的"官方"或"公认"版本。
3. 深入研究项目中某一个特定属性的当前领先版本、所有其他备选版本及其各自的得票情况。
4. 追溯项目中某一个特定属性从最初到现在的完整演变历史，了解它是如何被社区共同塑造的。

这些接口为前端构建信息丰富、透明度高的用户界面提供了坚实的数据基础，也体现了系统通过社区共识来逐步完善项目定义的核心。

该系统使得项目能够通过集体努力和透明的决策机制，从最初的概念有机地发展到完善的版本。
