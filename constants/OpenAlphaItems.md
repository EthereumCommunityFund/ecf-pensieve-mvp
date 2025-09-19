# Open Alpha Items

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
- 