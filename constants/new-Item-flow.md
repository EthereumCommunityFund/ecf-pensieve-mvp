# New Item Flow

## 1. 转换表格数据为 `IItemConfig` 类型的数据

文件转为`OpenAlphaItems.ts`文件，导出用 `alphaItemConfig` 字段，字段类型和格式需要按照 `constants/itemConfig.ts` 里的结构和类型进行转化，复用 `IItemConfig` 类型，不要新创建类型

### 转换规则
- item这一列为item名，直接复制到 `label` 字段，然后转为小写下划线格式（忽略括号后面的内容和特殊字符），成为key，比如 `Token Type (Token)+`，对应的key就是 `token_type`.
  - 重要：对已有字段的 key 以及 label 进行对比，忽略大小写、下划线、特殊字符等，结合语义进行判断是否为相同字段，如果碰到当前 `AllItemConfig` 已有的字段或者类似的字段，需要特殊标记 Potential duplicate, 并对重复可能性给出 high/medium/low 等级参考
- Short Description列对应 `shortDescription` 字段，`description\longDescription\placeholder` 等字段你先根据语义进行预设，用英文
- Data Example列对应的是这个item的表单类型，也就是 `formDisplayType` 字段，这里需要根据 `IFormDisplayType` 类型进行语义匹配
  - Text/Text Box对应 `string`， Long Text对应 `textarea`
  - option list对应 `select`, multi option 对应 `selectMultiple`
    - Y/N 其实对应的也就是 `select`
    - 需要补全options字段
    - 如果可以自行输入字段的话，对应 `autoComplete` 字段
  - URL对应 `link`
  - Table类型，先填个 `embedTable` 类型（在后面的步骤再处理）
    - 类似 `Table[Name: plain text | Role: Plain Text | Address: public address || social identifier] ` 这种写法的都是 `embedTable` 类型
  - 0x Address 对应的是 `smartContract` 或者 `multiContracts` 类型，这种 0x 开头的属于区块链钱包地址，不是普通的地名
  - 所有其他case: 缺失说明、无法确认或者匹配的类型，都先写个 `unknown` ，待我后续确认再处理
- Legitimacy Analysis列对应的 `legitimacy` 字段，需要复用 `ALL_METRICS` 变量
- Accountability Metric列对应的是 accountability字段， 需要复用 `ALL_METRICS` 变量
- ItemWeight 列很重要，首先添加一个key到 `lib/pocItems.ts` 里，`isEssential` 全部是false，`accountability_metric` 用表格里的itemWeight/10, 然后weight字段再引用对应的weight
- 其他字段
  - `isEssential` 全都设置false
  - `showReference` 设置true
  - `validationSchema` 字段，参考已有的类型进行初步匹配，如果不缺人的，留个 TODO
  - embedTable 类型的字段的 `showExpand` 都是 true，其他是 false
- 表格里剩下的其他列可以忽略

## 2. 添加确认的新字段
- 参考 `53ae0f2ba3d2f725e425abda214aee925895b3db` 这个 git commit
  - 将确认要添加的 item 的配置从 `constants/OpenAlphaItems.ts` 复制到 `constants/itemConfig.ts` 的后面
  - 在 `constants/itemSchemas.ts` 添加对应的 item 的 schema （参考已有字段的schema, 优先寻找相同`formDisplayType`类型的字段），然后添加对应的 `validationSchema` 字段
  - 在 `constants/tableConfig.ts` 里的 `ProjectTableFieldCategory` 变量，根据对应的 `category` 和 `subCategory` 匹配到对应的类别中， 将 item key 填到对应的 `itemsNotEssential` 字段里

## 3. 添加 `EmbedTable` 类型字段的规范流程
- **前置准备**
  - 招到 `constants/OpenAlpha-items.csv` 表里对应的字段行数据，进行语义化分析
  - 明确字段 key、业务含义与表格列结构（列名、类型、是否必填、选项来源），梳理默认值及指标权重。
  - 对比 `constants/itemConfig.ts` 和 `constants/OpenAlphaItems.ts` 现有字段，避免重复；若数据来源不明，需先与用户确认。
- **Step 1 – 定义类型（完成后务必暂停等待用户确认）**
  - 根据表格里的 `Data Example` 列的说明， 在 `types/item.ts` 新增以 `I` 开头的行数据接口，描述 embedTable 每列字段，参考 `types/item.ts:243` 的 `IAdvisors`。
  - 将新字段加入 `IEmbedTableFormDisplayType`、`IItemDataTypeMap` 等相关联合类型；如有额外类型映射，也在此阶段补齐。
  - 完成后暂停沟通，确认无误再继续后续步骤。
- **Step 2 – 定义校验 Schema**
  - 在 `constants/itemSchemas.ts` 编写 Yup 行校验（见 `constants/itemSchemas.ts:278` 示例），确保必填校验、URL 规范等规则齐全。
  - 将数组级校验追加到 `itemValidationSchemas`（参考 `constants/itemSchemas.ts:759`），这样创建项目与提交提案都会应用到最新校验。
- **Step 3 – 基础配置与权重**
  - 在 `lib/pocItems.ts` 注册新 key(如果已存在，则跳过，大概率已经存在)，补充 `isEssential` 与 `accountability_metric`（参考 `lib/pocItems.ts:224`），以便自动计算权重。
  - 复核 `constants/OpenAlphaItems.ts` 是否已有草稿配置（如 `constants/OpenAlphaItems.ts:14`）；若缺失，需先确认数据来源后再补录。
  - 将最终确认的配置迁入 `constants/itemConfig.ts`（参考 `constants/itemConfig.ts:1586`），补齐 `validationSchema`、`accountability`、`legitimacy` 等字段。
  - 按照 `category`/`subCategory`，在 `constants/tableConfig.ts` 对应分组中登记 `itemsNotEssential`（见 `constants/tableConfig.ts:212`）。
- **Step 4 – EmbedTable 类型注册**
  - 在 `constants/embedTable.ts` 维护三个列表：`EMBED_TABLE_FORM_TYPES`、`DYNAMIC_FIELD_EMBED_TABLE_TYPES`、`EMBED_TABLE_WITH_PROJECT_SELECTOR_TYPES`（仅当需要项目选择器时加入），可参考 `constants/embedTable.ts:4-33` 的 `advisors` 写法。
  - 此步骤决定默认值生成、动态表格复用与项目选择功能是否生效。
- **Step 5 – 表格列定义与录入组件**
  - 在 `components/biz/table/embedTable/dynamicFieldsConfig.ts` 定义列配置与 `tableComponent`，参考 `components/biz/table/embedTable/dynamicFieldsConfig.ts:170-203`。
  - 定义录入控件，新建 `components/biz/table/embedTable/item/<NewField>TableItem.tsx`，并在同文件底部注册到 `TABLE_ITEM_COMPONENTS`（见 `components/biz/table/embedTable/dynamicFieldsConfig.ts:207-213`）。
  - 通用选项（如布尔值）可沉淀在 `embedTableUtils.ts` 复用（`components/biz/table/embedTable/embedTableUtils.ts:145-148`）。
- **Step 6 – 默认值、解析与展示**
  - 在 `getDefaultEmbedTableFormItemValue`/`getDefaultValueByFormType` 中新增默认行结构，确保表单初始值正确（参考 `components/biz/table/embedTable/embedTableUtils.ts:75-94`）。
  - 在 `InputContentRenderer.tsx` 为新类型补充渲染分支，处理展开表格与摘要展示（示例 `components/biz/table/InputContentRenderer.tsx:1660-1797`），必要时扩展其他页面的展示逻辑。
- **Step 7 – 表单流程与 Prefill 校验**
  - 确认 `useAllDynamicFieldArrays`、`DynamicFieldTable` 已能识别新 `displayType`（参考 `components/biz/table/embedTable/useAllDynamicFieldArrays.ts:34-72`），若需项目选择器或额外数据源，补充对应 hook/常量并向用户确认数据来源。
- **Step 8 – 数据联动与 QA**
  - 如需后端或导入脚本支持，提前与相关负责方同步，保证接口契合前端类型。
  - 本地运行 `pnpm lint`、`pnpm test`，覆盖项目创建、提案提交、详情查看等场景，确认 embedTable 交互与校验正常。
  - 若存在历史数据迁移需求，需计划批量脚本并在上线前与用户确认迁移策略。
