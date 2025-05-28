好的，我已经仔细阅读了您提供的后端代码。下面是关于该 NEXT+TRPC 技术栈后端项目的业务逻辑中文 PRD，重点关注 **project、proposal、itemProposal、vote、projectLog** 这几个核心路由，并对相关接口进行详细说明，以便指导前端代码调用。

## 1. 引言

本文档旨在阐述项目核心业务逻辑及相关表结构关系和 API 接口细节。项目核心功能围绕着用户创建项目（Project）、针对项目整体或项目内具体条目（Item）提交提案（Proposal / ItemProposal）、用户对这些提案进行投票（Vote），并根据投票结果和预设规则（如权重、奖励机制）更新项目状态、记录项目日志（ProjectLog）以及激励用户。

**核心概念：**

* **项目 (Project)**：用户创建的主要实体，包含多个信息条目。项目有“未发布”和“已发布”两种状态。
* **提案 (Proposal)**：特指项目创建时，针对项目所有**核心条目 (Essential Item)** 的初始提案。
* **条目提案 (ItemProposal)**：用户针对项目中**单个非核心条目**或对已发布项目的**任意条目**提出的具体内容建议或修改。
* **投票 (Vote)**：用户对其认可的提案或条目提案表示支持的行为，投票时会附带用户当前的权重。
* **权重 (Weight)**：用户在系统中的影响力值，会影响其投票的分量，并可通过积极参与获得奖励来提升。
* **核心条目 (Essential Item)**：项目中必须包含的关键信息字段，定义在 `POC_ITEMS` 中，并标记 `isEssential: true`。
* **项目日志 (ProjectLog)**：记录项目中每个条目当前采纳的提案来源（是初始提案还是某个条目提案）。
* **奖励机制 (Reward Mechanism)**：用户通过创建被采纳的提案、成功发布项目等行为可以获得权重奖励。
* **仲裁数量 (Quorum Amount)**：某些操作（如项目发布、非核心条目首次提案的采纳）所需的最小投票人数。

---

## 2. 数据模型及关系

系统核心数据通过以下 PostgreSQL 表进行存储和管理，使用 Drizzle ORM 进行交互。

### 2.1. 核心表定义

* **`profiles` (用户档案表)**
    * `userId` (UUID, 主键): 用户唯一标识。
    * `name` (Text): 用户名。
    * `address` (Text): 用户钱包地址。
    * `weight` (Double): 用户权重，默认为 0。
    * `invitationCodeId` (BigInt, 外键 -> `invitationCodes`): 使用的邀请码 ID。
    * 其他：`avatarUrl`, `createdAt`, `updatedAt`。
* **`projects` (项目表)**
    * `id` (BigSerial, 主键): 项目唯一标识。
    * `name` (Text): 项目名称。
    * `creator` (UUID, 外键 -> `profiles.userId`): 项目创建者。
    * `isPublished` (Boolean, 默认 false): 项目是否已发布。
    * `itemsTopWeight` (JSONB, 默认 '{}'): 记录项目中每个条目 (key) 当前领先提案的总权重。
    * `support` (Double, 默认 0): 项目获得的总支持度（基于点赞者权重）。
    * `likeCount` (Integer, 默认 0): 项目的点赞数量。
    * 其他项目详情字段（如 `tagline`, `categories`, `logoUrl` 等）。
* **`proposals` (提案表 - 主要用于项目初始提案)**
    * `id` (BigSerial, 主键): 提案唯一标识。
    * `projectId` (BigInt, 外键 -> `projects.id`): 关联的项目 ID。
    * `creator` (UUID, 外键 -> `profiles.userId`): 提案创建者。
    * `items` (JSONB[]): 提案包含的项目条目及其内容，格式为 `[{key: string, value: any}]`。
    * `refs` (JSONB[]): 提案的参考链接。
* **`itemProposals` (条目提案表)**
    * `id` (BigSerial, 主键): 条目提案唯一标识。
    * `projectId` (BigInt, 外键 -> `projects.id`): 关联的项目 ID。
    * `creator` (UUID, 外键 -> `profiles.userId`): 条目提案创建者。
    * `key` (Text): 针对的项目条目的键名。
    * `value` (JSONB): 提案的具体内容。
    * `ref` (Text, 可选): 参考链接。
    * `reason` (Text, 可选): 提案原因。
* **`voteRecords` (投票记录表)**
    * `id` (BigSerial, 主键): 投票记录唯一标识。
    * `projectId` (BigInt, 外键 -> `projects.id`): 投票所属项目的 ID。
    * `proposalId` (BigInt, 外键 -> `proposals.id`, 可选): 关联的初始提案 ID。
    * `itemProposalId` (BigInt, 外键 -> `itemProposals.id`, 可选): 关联的条目提案 ID。
    * `creator` (UUID, 外键 -> `profiles.userId`): 投票者。
    * `key` (Text): 投票针对的项目条目的键名。
    * `weight` (Double): 投票时用户的权重。
* **`projectLogs` (项目日志表)**
    * `id` (UUID, 主键): 日志唯一标识。
    * `projectId` (BigInt, 外键 -> `projects.id`): 关联的项目 ID。
    * `proposalId` (BigInt, 外键 -> `proposals.id`, 可选): 关联的初始提案 ID。
    * `itemProposalId` (BigInt, 外键 -> `itemProposals.id`, 可选): 关联的条目提案 ID。
    * `key` (Text): 关联的项目条目的键名。
    * `isNotLeading` (Boolean, 默认 false): 标记该日志是否已不再是对应 key 的最新领先提案。
* **`likeRecords` (点赞记录表)**
    * `id` (BigSerial, 主键): 点赞记录唯一标识。
    * `projectId` (BigInt, 外键 -> `projects.id`): 被点赞的项目 ID。
    * `creator` (UUID, 外键 -> `profiles.userId`): 点赞用户。
    * `weight` (Double): 点赞时用户的权重 (此字段在 `likeProjectRouter` 中未显式使用，但 schema 中存在，可能用于未来扩展或后台计算)。
* 其他辅助表: `activeLogs` (用户活动日志), `notifications` (通知), `invitationCodes` (邀请码), `loginNonces` (登录随机数)。

### 2.2. 核心表关系说明 (基于 `lib/db/schema/relations.ts`)

* 一个 **用户 (profile)** 可以创建多个 **项目 (project)**、多个 **提案 (proposal)**、多个 **条目提案 (itemProposal)**，可以进行多次 **投票 (voteRecord)**，收到多个 **通知 (notification)**，产生多个 **活动日志 (activeLog)**，点赞多个 **项目 (likeRecord)**。
* 一个 **项目 (project)** 只能由一个 **用户 (creator)** 创建。它可以拥有多个 **提案 (proposal)**、多个 **条目提案 (itemProposal)**、多个 **项目日志 (projectLog)**、多个 **投票记录 (voteRecord)** (通过 `projectId` 关联)、多个 **点赞记录 (likeRecord)** 和多个 **通知 (notification)**。
* 一个 **提案 (proposal)** 必须属于一个 **项目 (project)**，并由一个 **用户 (creator)** 创建。它可以拥有多个 **投票记录 (voteRecord)** 和多个 **通知 (notification)**。
* 一个 **条目提案 (itemProposal)** 必须属于一个 **项目 (project)**，并由一个 **用户 (creator)** 创建。它可以拥有多个 **投票记录 (voteRecord)**。
* 一个 **投票记录 (voteRecord)** 必须由一个 **用户 (creator)** 创建，并且必须属于一个 **项目 (project)**。它或者关联一个 **提案 (proposalId)** (针对初始提案中的条目投票)，或者关联一个 **条目提案 (itemProposalId)** (针对具体条目提案的投票)。
* 一个 **项目日志 (projectLog)** 记录了某个 **项目 (projectId)** 的某个 **条目 (key)** 当前采纳的信息来源，该来源可以是初始 **提案 (proposalId)** 或某个 **条目提案 (itemProposalId)**。

---

## 3. 核心业务逻辑

### 3.1. 项目生命周期

#### 3.1.1. 项目创建与初始提案
当用户创建一个新项目时：
1.  在 `projects` 表中插入一条新记录，包含所有项目的基础信息，`creator` 为当前用户 ID，`isPublished` 默认为 `false`。
2.  系统自动为该项目创建一个初始的 `proposal`。此 `proposal` 包含所有在 `POC_ITEMS` 中定义的**核心条目 (Essential Item)** 及其在创建项目时提交的初始值。
3.  项目创建者（即初始提案创建者）会因成功提交包含所有核心条目的初始提案而获得一次性的权重奖励。奖励值为 `ESSENTIAL_ITEM_WEIGHT_AMOUNT * REWARD_PERCENT`。
4.  系统自动为该初始提案中的每一个核心条目，以创建者的名义创建一条 `voteRecord`，投票权重为创建者当前的 `weight`。
5.  记录项目创建和提案创建的活动日志 (`activeLogs`) 及奖励通知 (`notifications`)。

#### 3.1.2. 投票与权重 (针对未发布项目的初始提案)
其他用户可以对未发布项目的初始提案中的核心条目进行投票：
1.  用户选择一个初始提案中的特定条目 (`key`) 进行投票。
2.  系统检查用户是否已对该项目的该 `key` 在其他提案中投过票，或者是否已对当前提案的该 `key` 投过票。如果已投过，则不允许重复投票或需要先切换投票。
3.  创建一条 `voteRecords` 记录，包含 `proposalId` (初始提案ID)，投票的 `key`，投票者 `creator`，投票者当前的 `weight`，以及项目 `projectId`。
4.  **切换投票 (Switch Vote)**：如果用户已对项目中同一 `key` 的另一提案投过票，可以选择切换投票到新的目标提案。原投票记录的 `proposalId` 会更新为新的提案 ID。
5.  **取消投票 (Cancel Vote)**：用户可以取消自己对某个提案条目的投票，相关的 `voteRecord` 会被删除。提案创建者不能取消对自己提案的初始投票。

#### 3.1.3. 项目发布审查 (`scanPendingProject` 接口)
系统有一个定时或手动触发的机制 (`scanPendingProject`) 来扫描所有未发布的 (`isPublished = false`) 项目，判断它们是否满足发布条件。
1.  **发布条件**：
    * 对于项目初始提案 (`proposals`) 中的每一个**核心条目 (Essential Item)**：
        * 投票人数 (`key_voters`) 必须达到 `QUORUM_AMOUNT` (法定仲裁人数，当前为3)。
        * 该条目获得的总权重 (`key_weight`) 必须超过其在 `POC_ITEMS` 中定义的 `accountability_metric * WEIGHT` (必需权重)。
    * 初始提案必须包含所有定义为 `isEssential` 的条目，并且都满足上述投票人数和权重条件。
2.  **处理合格项目**：
    * 如果一个项目满足所有发布条件，系统会将其 `projects.isPublished` 状态更新为 `true`。
    * 将初始提案中各条目获得的最终权重记录到 `projects.itemsTopWeight` 字段中。
    * 为该项目和成功的初始提案创建一条 `projectLogs` 记录，表明这些核心条目的初始值已被采纳。
    * 初始提案的创建者（即项目创建者）将获得第二部分奖励，金额为 `ESSENTIAL_ITEM_WEIGHT_AMOUNT * (1 - REWARD_PERCENT)`。
    * 记录相关的用户活动和奖励通知。

### 3.2. 条目提案与更新 (ItemProposal)

用户可以对项目中的具体条目提出新的内容建议或修改，这通过 `itemProposals` 实现。这主要用于已发布项目的内容更新，或未发布项目中非核心条目的内容填充/修改。

#### 3.2.1. 创建条目提案
1.  用户针对某个 `projectId` 的特定 `key` (条目名) 提交 `value` (新内容)、可选的 `ref` (参考链接) 和 `reason` (原因)。
2.  系统创建一条 `itemProposals` 记录。
3.  记录用户活动日志。
4.  **特殊逻辑 (首次为非核心条目提案)**：
    * 如果该 `key` **不是**核心条目 (`isEssentialItem` 为 `false`)。
    * 并且该项目的该 `key` **之前没有**任何 `itemProposal` (通过检查 `projectLogs` 判断是否已有领先提案，或直接查询 `itemProposals`)。
    * 提案创建者会获得一次性奖励，金额为 `POC_ITEMS[key].accountability_metric * WEIGHT * REWARD_PERCENT`。其用户权重相应增加。
    * 系统自动为该条目提案创建一条创建者的 `voteRecord`，权重为其更新后的用户权重。
    * 记录奖励通知。

#### 3.2.2. 条目提案投票
用户可以对 `itemProposals` 进行投票。
1.  **`createItemProposalVote`** (首次为某项目的某 key 投票或之前投的是初始提案的票):
    * 用户为某个 `itemProposalId` 的 `key` 进行投票。
    * 系统检查用户是否已对该 `projectId` 的该 `key` 投过票（无论是投给其他 `itemProposal` 还是初始 `proposal`）。如果已投，则不允许创建新投票，应引导用户使用切换投票接口。
    * 创建一条 `voteRecords`，关联 `itemProposalId`、`projectId`、`key`，投票者 `creator` 和其当前 `weight`。
    * **结果处理**：
        * 获取该 `itemProposalId` 和 `key` 的所有投票。
        * 检查是否需要法定人数 (`needCheckQuorum`): 如果该 `key` 是非核心条目，并且在 `projectLogs` 中没有该 `key` 的记录（即首次有提案竞争成为该 key 的领先者），则需要达到 `QUORUM_AMOUNT`。
        * 如果需要法定人数但未达到，则不进行后续处理。
        * 计算当前条目提案的总得票权重 (`voteSum`)。
        * 获取项目当前的 `itemsTopWeight[key]` (该 key 当前领先提案的权重)。
        * 如果 `voteSum` 大于 `itemsTopWeight[key]`：
            * 该 `itemProposal` 成为新的领先提案。
            * 创建/更新 `projectLogs`，将新的 `itemProposalId` 记录为该 `key` 的来源。
            * 更新 `projects.itemsTopWeight[key]` 为新的 `voteSum`。
            * 奖励该 `itemProposal` 的创建者。奖励金额根据 `needCheckQuorum` 的状态有所不同：如果 `needCheckQuorum` 为 `true` (首次达到法定人数成为领先)，奖励为 `POC_ITEMS[key].accountability_metric * WEIGHT`；否则 (击败已有领先提案)，奖励为 `POC_ITEMS[key].accountability_metric * WEIGHT * (1 - REWARD_PERCENT)`。
            * 记录用户活动和奖励通知。
2.  **`switchItemProposalVote`** (切换在同一项目、同一 key 上的投票):
    * 用户希望将对项目 `projectId` 的 `key` 的投票，切换到新的 `itemProposalId`。
    * 系统找到用户之前对该 `projectId` 和 `key` 的投票记录 (`voteToSwitch`)。
    * 如果未找到或已投给当前目标 `itemProposalId`，则报错。
    * 更新该 `voteRecord` 的 `itemProposalId` 为新的目标 `itemProposalId`，`proposalId` 置空，并更新投票权重为用户当前 `weight`。
    * **结果处理** (同 `createItemProposalVote` 的结果处理逻辑)。
    * **处理原提案** (`handleOriginalProposalUpdate`): 如果被切换掉的那个原 `itemProposal` (`originalItemProposalId`) 曾经是 `projectLogs` 中的领先提案，需要重新计算其当前总权重。如果其总权重已低于项目中该 `key` 的 `itemsTopWeight` (因为当前用户移走了投票)，则标记其在 `projectLogs` 中的对应记录为 `isNotLeading = true`。
    * 记录用户活动日志。

### 3.3. 项目日志 (ProjectLog)

`projectLogs` 表的核心作用是追踪项目中每个 `key`（条目）当前采纳的最新、最权威的内容版本来源。
* 当一个项目的初始提案通过审查并发布时，会为所有核心条目创建 `projectLogs` 记录，指向该初始提案 `proposalId`。
* 当一个 `itemProposal` 的投票结果使其成为某个 `key` 的新领先者时：
    * 会创建一条新的 `projectLogs` 记录，包含 `projectId`, `itemProposalId`, 和 `key`。
    * 如果之前该 `key` 有一个领先的 `projectLog` (无论是来自初始提案还是其他条目提案)，那条旧的记录理论上应该被标记为不再领先 (`isNotLeading = true`)，或者通过查询时按时间排序来确定最新领先者 (代码中 `handleOriginalProposalUpdate` 处理了因选票移走导致原领先者不再领先的情况)。

### 3.4. 用户权重与激励

用户的 `weight` 是一个核心的声誉和激励机制。
* **获取途径**：
    * 创建项目并成功提交初始提案（包含所有核心条目）：获得 `ESSENTIAL_ITEM_WEIGHT_AMOUNT * REWARD_PERCENT`。
    * 作为项目初始提案的创建者，在项目成功发布时：获得 `ESSENTIAL_ITEM_WEIGHT_AMOUNT * (1 - REWARD_PERCENT)`。
    * 创建非核心条目的首个 `itemProposal` 并自动获得一票时：获得 `POC_ITEMS[key].accountability_metric * WEIGHT * REWARD_PERCENT`。
    * 创建的 `itemProposal` 在投票中胜出成为新的领先提案：
        * 若该 `key` 之前无领先提案且此次投票达到了 `QUORUM_AMOUNT`：获得 `POC_ITEMS[key].accountability_metric * WEIGHT`。
        * 若该 `key` 已有领先提案，此次投票胜出：获得 `POC_ITEMS[key].accountability_metric * WEIGHT * (1 - REWARD_PERCENT)`。
* **用途**：用户的 `weight` 直接作为其投票时的权重值，影响投票结果的计算。

### 3.5. 项目点赞 (Project Liking)

用户可以对项目进行点赞，以表示对其的支持。
1.  用户对某个 `projectId` 进行点赞。
2.  系统检查用户是否已点赞过该项目，防止重复点赞。
3.  创建一条 `likeRecords` 记录。
4.  更新 `projects` 表中对应项目的 `likeCount` (加1) 和 `support` (增加点赞用户的当前 `weight`)。
5.  记录用户活动日志。

---

## 4. API 接口文档

以下是核心业务模块的 tRPC 路由及其方法说明。

### 4.1. `projectRouter` - 项目管理

* **`createProject`** (protected)
    * **描述**: 创建一个新的项目。此操作是事务性的，会同时创建项目本身、一个包含所有核心条目的初始提案，并为创建者自动对这些条目投票，最后给予创建者第一部分奖励。
    * **输入 (`input`)**: 项目详细信息对象，包含 `name`, `tagline`, `categories`, `mainDescription`, `logoUrl`, `websiteUrl`, `dateFounded`, `devStatus`, `openSource`, `orgStructure`, `publicGoods`, `founders` (数组), `tags`, `whitePaper`, `dappSmartContracts`。可选字段包括 `appUrl`, `dateLaunch`, `fundingStatus`, `codeRepo`, `tokenContract`, `refs` (参考链接数组)。
    * **输出**: 创建成功的 `projects` 对象。
    * **调用逻辑**: 前端在用户填写完项目创建表单后调用。成功后，通常会跳转到项目详情页或用户项目列表。
    * **后端主要操作**:
        1.  启动数据库事务。
        2.  向 `projects` 表插入数据。
        3.  调用 `proposalRouter.createProposal` 创建初始提案（包含所有输入的核心条目）。
        4.  更新项目创建者的 `profiles.weight` (增加奖励)。
        5.  创建 `activeLogs` (项目创建、提案创建、投票创建)。
        6.  创建 `notifications` (奖励通知)。
        7.  如果任何一步失败，事务回滚。
* **`getProjects`** (public)
    * **描述**: 分页获取项目列表，可根据是否发布进行筛选。
    * **输入 (`input`)**: 可选对象，包含：
        * `limit` (Number, 默认 50, 最小 1, 最大 100): 每页数量。
        * `cursor` (Number, 可选): 上一页最后一条记录的 `id`，用于分页。
        * `isPublished` (Boolean, 可选, 默认 `false`): 是否只查询已发布的项目。
    * **输出**: `{ items: Project[], nextCursor?: number, totalCount: number }`。`Project` 对象会包含创建者信息 (`creator`)。如果查询的是未发布项目 (`isPublished: false`)，还会包含其 `proposals` 及关联的 `voteRecords` 和投票者信息。
    * **调用逻辑**: 用于项目列表展示页面，支持无限滚动或分页加载。
* **`getProjectById`** (public)
    * **描述**: 根据项目 ID 获取单个项目的详细信息。
    * **输入 (`input`)**: `{ id: number }`。
    * **输出**: `Project` 对象，包含 `creator` 信息和所有 `proposals` (及其关联的 `voteRecords` 和 `creator`)。
    * **调用逻辑**: 用于项目详情页面。
* **`scanPendingProject`** (public)
    * **描述**: 扫描所有未发布的项目，检查它们是否满足发布条件（核心条目获得足够的、达到法定人数的有效投票权重）。如果满足条件，则自动发布项目，并给初始提案创建者发放第二阶段奖励。
    * **输入 (`input`)**: 无。
    * **输出**: `{ success: boolean, processedCount: number, message: string }`。
    * **调用逻辑**: 此接口可能由后台定时任务调用，或由特定管理操作触发。前端一般不直接调用此接口进行常规操作。
    * **后端主要操作**:
        1.  查询所有 `projects.isPublished = false` 的项目。
        2.  对每个项目，检查其初始 `proposals` 中的所有核心条目：
            * 统计每个核心条目的有效投票人数 (`COUNT(DISTINCT vr.creator)`)。
            * 计算每个核心条目的总投票权重 (`SUM(vr.weight)`)。
        3.  如果所有核心条目都满足：投票人数 `>= QUORUM_AMOUNT` 且总权重 `> POC_ITEMS[key].accountability_metric * WEIGHT`。
        4.  则启动事务：
            * 更新 `projects.isPublished = true`。
            * 更新 `projects.itemsTopWeight`，记录各核心条目的最终获胜权重。
            * 创建 `projectLogs` 记录，关联到此初始提案。
            * 更新初始提案创建者 (项目创建者) 的 `profiles.weight` (增加奖励 `ESSENTIAL_ITEM_WEIGHT_AMOUNT * (1 - REWARD_PERCENT)`)。
            * 创建奖励 `notifications`。

### 4.2. `proposalRouter` - 提案管理 (主要用于项目创建时的初始提案)

* **`createProposal`** (protected)
    * **描述**: 创建一个新提案。在当前业务逻辑中，此接口主要被 `projectRouter.createProject` 内部调用以创建项目的初始提案。它会自动为提案中的每个条目记录创建者的投票。
    * **输入 (`input`)**:
        * `projectId` (Number): 关联的项目 ID。
        * `items` (Array): `[{ key: string, value: any }]` 提案条目数组。
        * `refs` (Array, 可选): `[{ key: string, value: string }]` 参考链接数组。
    * **输出**: 创建成功的 `proposals` 对象。
    * **调用逻辑**: 通常由后端 `projectRouter.createProject` 调用。
    * **后端主要操作**:
        1.  验证项目存在。
        2.  获取当前用户信息 (主要是 `weight`)。
        3.  向 `proposals` 表插入数据。
        4.  对 `input.items` 中的每个条目：
            * 向 `voteRecords` 表插入一条记录，`creator` 为当前用户，`proposalId` 为新创建的提案ID，`key` 为条目key，`weight` 为用户当前权重，`projectId` 为输入中的 `projectId`。
            * 创建 `activeLogs` (投票创建)。
        5.  创建 `activeLogs` (提案创建)。
* **`getProposalsByProjectId`** (public)
    * **描述**: 获取指定项目 ID下的所有提案。
    * **输入 (`input`)**: `{ projectId: number }`。
    * **输出**: `Proposal[]` 数组，每个 Proposal 对象包含 `creator` 信息。
    * **调用逻辑**: 前端在项目详情页展示项目相关提案列表时使用。
* **`getProposalById`** (public)
    * **描述**: 根据提案 ID 获取单个提案的详细信息。
    * **输入 (`input`)**: `{ id: number }`。
    * **输出**: `Proposal` 对象，包含 `creator` 信息。
    * **调用逻辑**: 用于展示特定提案的详情。

### 4.3. `itemProposalRouter` - 条目提案管理

* **`createItemProposal`** (protected)
    * **描述**: 用户针对项目中的某个具体条目 (`key`) 提出新的内容或修改。
    * **输入 (`input`)**:
        * `projectId` (Number): 关联的项目 ID。
        * `key` (String): 提案针对的项目条目的键名。
        * `value` (Any): 提案的具体内容。
        * `ref` (String, 可选): 参考链接。
        * `reason` (String, 可选): 提案原因。
    * **输出**: 创建成功的 `itemProposals` 对象。
    * **调用逻辑**: 用户在项目详情页针对某个可提案的条目发起新的建议时调用。
    * **后端主要操作**:
        1.  验证项目存在。
        2.  启动数据库事务。
        3.  向 `itemProposals` 表插入数据。
        4.  创建 `activeLogs` (条目提案创建)。
        5.  **条件性奖励与自动投票** (如果 `key` 不是核心条目，且该 `key` 在此项目中是首次被提案):
            * 计算奖励值 `reward = POC_ITEMS[key].accountability_metric * WEIGHT * REWARD_PERCENT`。
            * 获取用户当前 `weight`，计算新权重 `finalWeight = userProfile.weight + reward`。
            * 更新用户 `profiles.weight` 为 `finalWeight`。
            * 创建奖励 `notifications`。
            * 调用 `handleVoteRecord` 为当前用户对此条目提案自动投一票，权重为 `finalWeight`。
        6.  事务提交。

### 4.4. `voteRouter` - 投票管理

* **`createVote`** (protected)
    * **描述**: 用户对**初始项目提案 (`proposals`)** 中的某个条目 (`key`) 进行投票。
    * **输入 (`input`)**:
        * `proposalId` (Number): 目标初始提案的 ID。
        * `key` (String): 投票针对的条目键名。
    * **输出**: 创建成功的 `voteRecords` 对象。
    * **调用逻辑**: 用户在查看未发布项目的初始提案详情时，对具体条目进行投票。
    * **后端主要操作**:
        1.  验证目标提案及其关联项目存在且项目未发布。
        2.  检查用户是否已对该 `proposalId` 的该 `key` 投过票 (禁止)。
        3.  检查用户是否已对该 `projectId` 的该 `key` 在其他 `proposalId` 下投过票 (禁止，应使用 `switchVote`)。
        4.  获取用户当前 `weight`。
        5.  向 `voteRecords` 表插入数据，包含 `proposalId`, `key`, `creator`, `weight`, `projectId`。
        6.  创建 `activeLogs` (投票创建)。
* **`switchVote`** (protected)
    * **描述**: 用户更改其在某个项目、某个条目 (`key`) 上的投票目标，从一个**初始项目提案 (`proposals`)** 切换到另一个**初始项目提案**。
    * **输入 (`input`)**:
        * `proposalId` (Number): 新的目标初始提案的 ID。
        * `key` (String): 投票针对的条目键名。
    * **输出**: 更新后的 `voteRecords` 对象。
    * **调用逻辑**: 当用户想改变对某个条目的投票立场，从一个初始提案改投另一个初始提案时。
    * **后端主要操作**:
        1.  验证目标提案及其关联项目存在且项目未发布。
        2.  查找用户在同一 `projectId` 和 `key` 下的现有 `voteRecord`。
        3.  如果找不到或已投给当前 `proposalId`，则报错。
        4.  禁止从用户自己创建的提案中切换出选票。
        5.  更新找到的 `voteRecord` 的 `proposalId` 为新的目标 `proposalId`，并更新 `weight` 为用户当前权重。
        6.  创建 `activeLogs` (投票更新)。
* **`cancelVote`** (protected)
    * **描述**: 用户取消其对某个**初始项目提案 (`proposals`)** 中条目的投票。
    * **输入 (`input`)**: `{ id: number }` (要取消的 `voteRecords` 的 ID)。
    * **输出**: 被删除的 `voteRecords` 对象。
    * **调用逻辑**: 用户希望撤销之前对某个初始提案条目的投票。
    * **后端主要操作**:
        1.  验证该 `voteRecord` 存在、属于当前用户，且其关联的提案项目未发布。
        2.  禁止取消对自己创建提案的投票。
        3.  从 `voteRecords` 表中删除该记录。
        4.  创建 `activeLogs` (投票删除)。
* **`getVotesByProposalId`** (public)
    * **描述**: 获取指定初始提案 ID 的所有投票记录。
    * **输入 (`input`)**: `{ proposalId: number }`。
    * **输出**: `VoteRecord[]` 数组，每个对象包含投票者 `creator` 的信息。
    * **调用逻辑**: 在提案详情页显示投票者列表和详情。
* **`getVotesByProjectId`** (public)
    * **描述**: 获取指定项目 ID 的所有投票记录（包括对初始提案和条目提案的投票）。
    * **输入 (`input`)**: `{ projectId: number }`。
    * **输出**: `VoteRecord[]` 数组，每个对象包含投票者 `creator` 的信息。
    * **调用逻辑**: 可能用于项目概览或统计页面。
* **`createItemProposalVote`** (protected)
    * **描述**: 用户对某个**条目提案 (`itemProposals`)** 进行投票。这是用户首次对项目中特定 `key` 进行投票，或者之前投的是已删除/无效的票。
    * **输入 (`input`)**:
        * `itemProposalId` (Number): 目标条目提案的 ID。
        * `key` (String): 投票针对的条目键名（应与 `itemProposal.key` 一致）。
    * **输出**: 创建/更新成功的 `voteRecords` 对象。
    * **调用逻辑**: 用户在项目详情页看到某个条目的不同条目提案列表时，选择一个进行投票。
    * **后端主要操作 (事务性)**:
        1.  验证 `itemProposal` 存在。
        2.  检查用户是否已对该 `projectId` 的该 `key` 在任何（有效的）`itemProposal` 或 `proposal` 中投过票。如果存在，则抛出错误，提示用户应使用 `switchItemProposalVote`。
        3.  调用 `handleVoteRecord` 创建新的 `voteRecord`，关联 `itemProposalId`, `key`, `creator`, 用户当前 `weight`, `projectId`。
        4.  调用 `checkNeedQuorum` 判断此 `key` 是否需要达到法定投票人数。
        5.  调用 `processItemProposalVoteResult` 处理投票结果：
            * 如果达到条件（满足仲裁人数（如果需要）且总权重超过当前该 `key` 的领先者），则：
                * 创建 `projectLogs` 记录，将此 `itemProposal` 设为 `key` 的新领先者。
                * 更新 `projects.itemsTopWeight[key]`。
                * 奖励 `itemProposal` 的创建者，并更新其 `profiles.weight`。
                * 创建奖励 `notifications`。
* **`switchItemProposalVote`** (protected)
    * **描述**: 用户更改其在某个项目、某个条目 (`key`) 上的投票目标，可以是从一个 `itemProposal` 切换到另一个 `itemProposal`，或者从一个初始 `proposal` 的条目切换到一个 `itemProposal`。
    * **输入 (`input`)**:
        * `itemProposalId` (Number): 新的目标条目提案的 ID。
        * `key` (String): 投票针对的条目键名。
    * **输出**: 更新后的 `voteRecords` 对象。
    * **调用逻辑**: 用户已对某项目的某 `key` 投过票，现想改投该 `key` 下的另一个 `itemProposal`。
    * **后端主要操作 (事务性)**:
        1.  验证目标 `itemProposal` 存在。
        2.  查找用户在同一 `projectId` 和 `key` 下的现有 `voteRecord` (`voteToSwitch`)。
        3.  若未找到或已投当前目标，则报错。
        4.  记录原投票关联的 `originalItemProposalId` (如果存在)。
        5.  更新 `voteToSwitch` 记录：设置 `itemProposalId` 为新的目标ID，`proposalId` 设为 `null`，并更新 `weight`。
        6.  调用 `checkNeedQuorum` 判断此 `key` 是否需要达到法定投票人数。
        7.  调用 `processItemProposalVoteResult` 处理新目标 `itemProposal` 的投票结果（逻辑同 `createItemProposalVote`）。
        8.  如果 `originalItemProposalId` 存在（即原投票是投给另一个 `itemProposal` 的），调用 `handleOriginalProposalUpdate` 检查原 `itemProposal` 是否因失去这张选票而不再是领先者，如果是，则更新其在 `projectLogs` 中的状态。
        9.  创建 `activeLogs` (投票更新)。

### 4.5. `projectLogRouter` - 项目日志查询

* **`getLeadingProposalsByProjectId`** (public)
    * **描述**: 获取指定项目当前所有条目 (`key`) 的领先提案信息。返回结果会区分来源是初始提案还是条目提案。
    * **输入 (`input`)**: `{ projectId: number }`。
    * **输出**: `{ withoutItemProposal: ProjectLog[], withItemProposal: ProjectLog[] }`。每个 `ProjectLog` 对象包含其关联的 `proposal` (及创建者) 或 `itemProposal` (及创建者) 的信息。
    * **调用逻辑**: 在项目详情页顶部或关键位置展示项目当前各条目的“官方”或“社区采纳”的内容。
* **`getProposalsByProjectIdAndKey`** (public)
    * **描述**: 获取指定项目特定条目 (`key`) 的当前领先提案信息，以及该条目下的所有其他条目提案。
    * **输入 (`input`)**: `{ projectId: number, key: string }`。
    * **输出**: `{ leadingProposal?: ProjectLog, allItemProposals: ItemProposal[] }`。`leadingProposal` 包含关联的提案/条目提案及其投票和创建者信息。`allItemProposals` 包含该 `key` 下的所有条目提案及其投票和创建者信息。
    * **调用逻辑**: 当用户点击查看项目中某个特定条目的详细信息和所有相关提案时使用。
* **`getLeadingProposalHistoryByProjectIdAndKey`** (public)
    * **描述**: 获取指定项目特定条目 (`key`) 的所有历史领先提案记录（按时间倒序）。
    * **输入 (`input`)**: `{ projectId: number, key: string }`。
    * **输出**: `ProjectLog[]` 数组，每个对象包含其关联的 `proposal` (及创建者、投票) 或 `itemProposal` (及创建者、投票) 的信息。
    * **调用逻辑**: 用于展示某个项目条目的内容变更历史。

### 4.6. `likeProjectRouter` - 项目点赞

* **`likeProject`** (protected)
    * **描述**: 用户点赞一个项目。
    * **输入 (`input`)**: `{ projectId: number }`。
    * **输出**: 创建成功的 `likeRecords` 对象。
    * **调用逻辑**: 用户在项目列表或详情页点击点赞按钮。
    * **后端主要操作 (事务性)**:
        1.  验证项目存在。
        2.  检查用户是否已点赞过该项目。
        3.  获取用户当前 `weight`。
        4.  向 `likeRecords` 表插入数据。
        5.  更新 `projects` 表：`support` 增加用户权重，`likeCount` 加 1。
        6.  创建 `activeLogs` (点赞创建)。

---

## 5. 其他模块简述

以下模块虽然不是本次分析的重点，但对其功能进行简要说明：

* **`authRouter`**: 处理用户认证，包括生成 SIWE (Sign-In with Ethereum) 随机数 (`generateNonce`)，验证签名和用户信息 (`verify`)，检查用户是否已注册 (`checkRegistration`)。新用户注册时会校验邀请码 (`inviteCode`)。
* **`fileRouter`**: 处理文件上传，目前支持图片上传到 R2 存储，并返回文件的公开 URL。
* **`userRouter`**: 管理用户信息，如获取当前登录用户信息 (`getCurrentUser`)，根据钱包地址获取用户信息 (`getUserByAddress`)，以及更新用户档案（如用户名、头像）(`updateProfile`)。
* **`notificationRouter`**: 管理用户通知，包括获取未读通知 (`getUserNotifications`) 和标记通知为已读 (`markAsRead`)。
* **`activeRouter`**: 提供用户活动记录查询，如按天统计用户活动 (`getUserDailyActivities`) 和分页获取用户详细活动列表 (`getUserActivities`)。

---

本文档基于提供的代码进行分析，如有未尽之处或后续代码更新，应以最新代码为准。