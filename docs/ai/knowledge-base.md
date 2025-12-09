# AI 知识库（后端业务语义提炼）

## 1. 数据存放位置速览
- 项目主表 `projects`：仅存必填核心字段（name/tagline/...）、发布状态 `is_published`、`items_top_weight`、`has_proposal_keys` 等。
- 初始提案 `proposals.items`：未发布阶段的完整项目条目列表（数组元素 `{key,value}`）。
- 发布后快照 `project_snaps.items`：发布时的条目快照（同结构 `{key,value}`），查询已发布项目用它。
- 条目提案 `item_proposals`：针对单个 `key` 的替代值；`vote_records.item_proposal_id` 指向它。
- 投票 `vote_records`：按 key 投给 `proposal_id`（初始提案）或 `item_proposal_id`（条目提案），同一用户在同项目同 key 只能有一条有效票。
- 领先日志 `project_logs`：每个 key 的当前领先来源（`item_proposal_id` 或历史），`is_not_leading=false` 的最新记录为当前领先。

## 2. 核心业务流程（生成/查询提示）
1) **创建项目**  
   - 写 `projects`（核心列）；生成初始 `proposal`（items=全部输入字段）；为每个 key 插入 `vote_records`（proposalId 有值）。  
   - 更新用户权重（奖励 `ESSENTIAL_ITEM_WEIGHT_AMOUNT * 0.1`）。
2) **条目提案**  
   - 针对单项目单 key 创建 `item_proposals`；首次出现的 key 会写入 `projects.has_proposal_keys`，并奖励提案人。  
   - 若用户已有该 key 的票会自动 switch 到新条目提案。
3) **投票**  
   - 初始提案投票：仅未发布项目；一个 key 只能投一个 proposal（否则需 switchVote）。  
   - 条目提案投票：一个 key 只能投一个 item_proposal（否则需 switchItemProposalVote）。  
4) **领先与共识**  
   - 计算票重总和，与当前 `items_top_weight[key]` 比较；若超过（或无领先且满足 quorum），写入 `project_logs` 为领先，并更新 `projects.items_top_weight`、奖励提案人、同步 `project_snaps`。  
   - 核心条目（essential）不需要 quorum 检查；非核心条目默认 quorum=3 票。
5) **发布判定**  
   - 仅未发布项目；要求所有核心条目：投票人数≥3 且权重 > `accountability_metric*10`。  
   - 选择总权重最高的 proposal 作为基准，批量生成 `item_proposals` + `project_logs` + `project_snaps`，`projects.is_published=true`，写 `ranks.published_genesis_weight`。

## 3. 字段词典/权重/枚举（全量，可离线）
- 常量（`lib/constants.ts`）：`WEIGHT=10`，`REWARD_PERCENT=0.1`，`QUORUM_AMOUNT=3`；权重=metric*10，奖励=metric*10*0.1。
- 核心必填（isEssential=true，存 `projects` 列，创建时同步进 proposals.items；metric→weight=metric*10）：  
  | key | metric | weight | 说明/枚举 |  
  | --- | --- | --- | --- |  
  | name | 1 | 10 | 项目名 |  
  | tagline | 1 | 10 | 标语 |  
  | categories | 1 | 10 | 分类数组 |  
  | mainDescription | 1 | 10 | 描述 |  
  | logoUrl | 1 | 10 | LOGO |  
  | websites | 1 | 10 | 网站列表 |  
  | appUrl | 1 | 10 | 应用地址 |  
  | dateFounded | 1 | 10 | 成立日期 |  
  | dateLaunch | 2 | 20 | 上线日期 |  
  | devStatus | 2 | 20 | 枚举见下 |  
  | fundingStatus | 2 | 20 | Yes/No |  
  | openSource | 2 | 20 | Yes/No |  
  | codeRepo | 3 | 30 | 仓库链接 |  
  | tokenContract | 1 | 10 | 代币合约 |  
  | orgStructure | 3 | 30 | 枚举见下 |  
  | publicGoods | 1 | 10 | Yes/No |  
  | founders | 2 | 20 | 创始团队 |  
  | tags | 1 | 10 | 标签数组 |  
  | whitePaper | 1 | 10 | 白皮书 |  
  | dappSmartContracts | 1 | 10 | 合约清单 |
- 非核心但 metric>0（均可出现在 proposals.items / project_snaps.items / item_proposals）：  
  - 账号/融资/治理：`adoption_plan(2)`, `launch_plan(3)`, `roadmap(1)`, `ecosystem_projects(1)`, `audit_status(3)`, `dapp_category(1)`, `protocol_built_on(3)`, `core_team(4)`, `team_incentives(2)`, `ownership_of_project(4)`, `project_funded_date(1)`, `contributing_funds(1)`, `total_grants(1)`, `token_sales(4)`, `budget_plans(4)`, `token_type(2)`, `token_specifications(1)`, `expense_statements(1)`, `runway(2)`, `income_and_revenue_statements(3)`, `token_issuance_mechanism(2)`, `token_launch_date(1)`, `total(1)`, `governance_structure(2)`, `physical_entity(2)`, `governance_mechanism(1)`, `treasury_vault_address(4)`, `treasury_mechanism(2)`, `funding_received_grants(1)`, `social_links(1)`, `affiliated_projects(1)`, `contributing_teams(1)`, `stack_integrations(1)`, `org_structure(3)`, `advisors(3)`, `contributors(2)`, `contributors_organization(4)`, `audit_status_duplicate(3)`, `endorsers(3)`, `constitution(2)`, `milestone_type(3)`, `software_license(1)`, `roadmap_timeline(3)`, `airdrops(2)`, `team_location(2)`, `ownership_of_projects(2)`, `smart_contract_audits(2)`, `token_benefits(3)`, `token_risks(4)`, `token_rights(3)`, `token_obligations(3)`, `dapp_storage_stack(3)`, `dapp_account_management_stack(3)`, `dapp_logic_program_stack(3)`, `user_data_storage_stack(3)`, `unique_value_proposition(2)`, `audit_report(4)`, `vault_address_step2(6)`, `previous_funding_rounds(4)`, `milestone(6)`, `vault_multi_sig_holder_addresses_step2(2)`, `on_chain_treasury_step1(10)`, `private_funding_rounds(2)`, `decentralized_governance(8)`, `locking_period_team(4)`, `token_utility(4)`, `investment_stage(6)`。
- 非核心且 metric=0（完整保留，供查询与提示）：  
  `board_incentive`, `blockchain_explorer`, `motion_types`, `board_members`, `total_votes`, `total_motion_types`, `dao_source_code`, `followers`, `contribution_frequency_ecf_page`, `token_concentration`, `number_of_nodes`, `geographical_distribution`, `token_inflation_rate`, `tools`, `participation_threshold`, `token_lock_up_period`, `dex_24h_volume`, `dex_market_cap`, `token_roi`, `team_token_locking_period`, `capital_endorsers`, `token_roi_token`, `distribution_graph`, `token_burn_rate`, `exchanges_list`, `distribution`, `market_cap`, `token_distribution`, `funding_status`(下划线版), `asset_statements`, `supplied_circulation`, `complaints_redress_rating`, `node_anonimity`, `project_funded`, `total_investment_amount`, `3rd_party_participation_services`, `number_of_nodes_sub_maintainence`, `related_projects`, `protocol_blockchain`, `community_sentiment`, `rating`, `resilience_sustainability_rating`, `community_participation_rating`, `security_rating`, `project_partnerships`, `audit_metric`, `financial_status`, `income_revenue`, `investments`, `fundraising_price`。
- 枚举（来自 `constants/itemConfig.ts`，需在提示中固定）：  
  - `investment_stage`: `No Investment | Pre-Seed | Seed | Series A | Series B | Series C+ | Token Listed | Grant Funded | Acquired/Merged`（“种子轮”→`Seed`）。  
  - `devStatus`: `Idea/Whitepaper | Prototype | In development | Alpha | Beta | Live (working product) | Broken / Abandoned | Concept | Stealth | Active Community`  
  - `openSource`: `Yes | No`  
  - `publicGoods`: `Yes | No`  
  - `orgStructure`: `For-Profit Company | Non-Profit Organization / Association | Foundation | Cooperative | DAO | Federated DAO / SubDAO | Project within a DAO | Anonymous Collective`  
  - `fundingStatus`: `Yes | No`

## 4. 查询与 SQL 生成提示
- **已发布项目**：使用 `project_snaps` + `projects.is_published=true`，对 `items` 数组做 JSON 过滤。示例：
  ```sql
  SELECT p.id, p.name
  FROM projects p
  JOIN project_snaps ps ON ps.project_id = p.id
  WHERE p.is_published = true
    AND EXISTS (
      SELECT 1 FROM jsonb_array_elements(ps.items) elem
      WHERE elem->>'key' = 'investment_stage'
        AND elem->>'value' = 'Seed'
    );
  ```
- **未发布项目（初始提案语义）**：使用 `proposals`（或最新）+ `projects.is_published=false`：
  ```sql
  SELECT DISTINCT p.id, p.name
  FROM projects p
  JOIN proposals prop ON prop.project_id = p.id
  WHERE p.is_published = false
    AND EXISTS (
      SELECT 1 FROM jsonb_array_elements(prop.items) elem
      WHERE elem->>'key' = 'investment_stage'
        AND elem->>'value' = 'Seed'
    );
  ```
- **按当前领先值查询（含条目提案）**：用 `project_logs` 最新记录 + `item_proposals.value`：
  ```sql
  WITH latest AS (
    SELECT pl.*, ROW_NUMBER() OVER(PARTITION BY pl.project_id, pl.key ORDER BY pl.created_at DESC) rn
    FROM project_logs pl
    WHERE pl.is_not_leading = false
  )
  SELECT p.id, p.name, ip.value
  FROM projects p
  JOIN latest l ON l.project_id = p.id AND l.rn = 1
  JOIN item_proposals ip ON ip.id = l.item_proposal_id
  WHERE l.key = 'investment_stage'
    AND ip.value->>'value' = 'Seed'; -- 若存储为简单字符串则用 ip.value::text='\"Seed\"'
  ```
- **提取枚举分布**：对 `project_snaps.items` 展开，聚合各取值计数，帮助模型学习真实值。  
- **安全提示**：仅生成只读查询；禁止 UPDATE/DELETE/TRUNCATE；必要时限制返回列。

## 5. 提示工程建议（供系统/工具描述）
- 固定注入：  
  - 字段全集 = `pocItems` keys；核心必填如上；融资轮次 key=`investment_stage`，枚举如上。  
  - 已发布查 `project_snaps.items`；未发布查 `proposals.items` 或领先值用 `project_logs`+`item_proposals`。  
  - 仅输出 SELECT；若用户用“种子轮/Pre-Seed/Token Listed”等语言，自动映射到 `investment_stage` 的枚举值。  
  - 若 key 不在 `pocItems`，视为无效；不要猜测新字段。
- Few-shot 建议：附上上面三条 SQL 示例，减少歧义。

