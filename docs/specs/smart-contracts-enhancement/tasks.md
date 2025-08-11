# 智能合约增强功能 - 实施任务列表

## 1. 数据库和数据模型更新

### 1.1 更新 projects 表 schema
- [ ] 在 `lib/db/schema/projects.ts` 中更新 `dappSmartContracts` 字段定义
  - 将类型从 `text` 改为 `jsonb`，使用泛型定义 `DappSmartContractsData` 类型
  - 定义 TypeScript 接口描述 JSONB 数据结构
  - **参考需求**: 需求 5 - 数据验证和存储，需求 4 - 适用性标签，需求 6 - 参考资料功能

### 1.2 创建数据库迁移文件
- [ ] 创建迁移文件 `update_dapp_smart_contracts_to_jsonb.ts`
  - 备份现有的 text 类型数据
  - 将 `dapp_smart_contracts` 字段从 TEXT 转换为 JSONB
  - 处理旧数据格式（逗号分隔的地址字符串）转换为结构化格式
  - 创建 GIN 索引优化 JSONB 查询性能
  - **参考需求**: 需求 5 - 数据验证和存储中的向后兼容性要求

### 1.3 执行数据库迁移
- [ ] 使用 `pnpm run db:generate` 生成迁移文件
- [ ] 使用 `pnpm run db:migrate` 执行迁移
- [ ] 验证迁移结果，确保旧数据正确转换

## 2. 后端 API 开发

### 2.1 创建智能合约服务层
- [ ] 创建 `lib/services/smartContractService.ts` 文件
  - 实现 `validateContracts` 方法：验证地址格式和重复检测
  - 实现 `updateSmartContracts` 方法：直接更新项目表的 `dappSmartContracts` JSONB 字段
  - 实现 `getSmartContracts` 方法：查询并处理 JSONB 数据，兼容旧格式
  - 实现 `checkUserPermission` 方法：验证用户权限
  - **参考需求**: 需求 1.4 - 地址格式验证，需求 5 - 数据验证规则

### 2.2 创建 tRPC 路由
- [ ] 创建 `lib/trpc/routers/smartContracts.ts` 文件
  - 定义 Zod schema 验证输入数据，注意 projectId 类型为 number
  - 实现 `update` mutation：调用服务层更新 JSONB 数据
  - 实现 `get` query：查询并返回结构化的智能合约数据
  - 添加错误处理和权限验证
  - **参考需求**: 需求 1 - 链选择和地址输入的验收标准

### 2.3 注册路由到主路由器
- [ ] 在 `lib/trpc/routers/index.ts` 中导入并注册 smartContracts 路由
  - **参考需求**: 系统集成需求

## 3. 地址验证工具开发

### 3.1 创建地址验证工具类
- [ ] 创建 `lib/utils/addressValidation.ts` 文件
  - 使用 ethers.js 实现基础地址格式验证
  - 实现 EIP-55 校验和验证（可选）
  - 实现批量地址验证方法
  - 实现逗号分隔地址字符串解析
  - **参考需求**: 需求 5 - 地址验证规则，包括格式验证和重复检测

### 3.2 创建链配置管理
- [ ] 创建 `constants/chains.ts` 文件
  - 定义支持的区块链列表（Ethereum、BSC、Polygon 等）
  - 包含每个链的配置信息（名称、图标路径、区块浏览器 URL）
  - 实现链查询辅助函数
  - **参考需求**: 需求 1.5 - 支持的区块链列表

## 4. 前端组件开发

### 4.1 创建主容器组件
- [ ] 创建 `components/biz/project/smart-contracts/SmartContractsField.tsx`
  - 实现整体布局：标题、权重显示、适用性切换
  - 管理智能合约列表状态
  - 处理添加/删除链的逻辑
  - **参考需求**: 需求 3 - 用户界面和交互，需求 4 - 适用性标签

### 4.2 创建链选择组件
- [ ] 创建 `components/biz/project/smart-contracts/ChainSelector.tsx`
  - 实现下拉选择器，显示支持的区块链列表
  - 防止选择已存在的链
  - 支持禁用状态
  - **参考需求**: 需求 1.1、1.5 - 链选择下拉菜单

### 4.3 创建地址输入组件
- [ ] 创建 `components/biz/project/smart-contracts/AddressInput.tsx`
  - 实现逗号分隔的多地址输入
  - 显示提示文本 "use the comma ',' to separate multiple addresses"
  - 集成实时地址验证
  - 显示验证错误信息
  - **参考需求**: 需求 1.3、1.6 - 多地址输入和提示文本

### 4.4 创建单个合约条目组件
- [ ] 创建 `components/biz/project/smart-contracts/ContractEntry.tsx`
  - 组合链选择器和地址输入组件
  - 实现删除按钮（红色 X 图标）
  - 处理数据更新回调
  - **参考需求**: 需求 3.5 - 删除链功能

### 4.5 创建适用性切换组件
- [ ] 创建 `components/biz/project/smart-contracts/ApplicableToggle.tsx`
  - 实现 "Applicable" 和 "N/A" 切换按钮
  - 切换时触发状态更新
  - **参考需求**: 需求 4 - 适用性标签的所有验收标准

### 4.6 创建参考资料组件
- [ ] 创建 `components/biz/project/smart-contracts/References.tsx`
  - 实现添加/编辑/删除参考链接
  - 验证 URL 格式
  - **参考需求**: 需求 6 - 参考资料功能

## 5. 实时验证和错误处理

### 5.1 实现前端实时验证
- [ ] 在 AddressInput 组件中添加防抖验证逻辑（300ms 延迟）
  - 调用 addressValidation 工具进行格式验证
  - 检测同一链上的重复地址
  - 显示相应的错误消息
  - **参考需求**: 需求 3.3、3.4 - 实时验证，非功能性需求中的性能要求

### 5.2 创建错误显示组件
- [ ] 创建 `components/biz/project/smart-contracts/ErrorDisplay.tsx`
  - 统一的错误信息展示样式
  - 支持显示多个错误
  - **参考需求**: 需求 3.4 - 错误提示信息，错误消息定义

## 6. 状态管理集成

### 6.1 创建 React Hook Form 集成
- [ ] 创建 `hooks/useSmartContractsForm.ts`
  - 定义表单 schema 和验证规则
  - 处理 N/A 切换时的数据清理
  - 集成到项目表单中
  - **参考需求**: 需求 4.3 - N/A 切换时的状态恢复

### 6.2 创建数据查询和更新 hooks
- [ ] 创建 `hooks/useSmartContracts.ts`
  - 封装 tRPC 查询和更新逻辑
  - 处理加载和错误状态
  - 实现缓存失效策略
  - **参考需求**: 系统集成需求

## 7. 项目表单集成

### 7.1 更新项目创建/编辑表单
- [ ] 在 `components/pages/project/ProjectForm.tsx` 中集成 SmartContractsField
  - 将组件添加到技术标签页
  - 连接表单状态管理
  - 处理数据提交
  - **参考需求**: 需求 1 - 在项目创建页面的技术标签页集成

### 7.2 更新项目数据提交逻辑
- [ ] 修改项目创建/更新的 API 调用
  - 包含智能合约数据
  - 处理提交错误
  - **参考需求**: 需求 5.5 - 至少一个有效的链和地址组合验证

## 8. 数据迁移和兼容性

### 8.1 创建数据转换工具
- [ ] 创建 `utils/smartContractsTransform.ts`
  - 实现旧格式（逗号分隔字符串）到 JSONB 格式的转换函数
  - 实现 JSONB 格式到逗号分隔字符串的转换（供导出或显示用）
  - **参考需求**: 数据迁移策略，保持向后兼容性

### 8.2 实现缓存策略
- [ ] 创建 `lib/cache/smartContractsCache.ts`
  - 使用 Next.js unstable_cache 实现查询缓存
  - 实现缓存失效逻辑
  - **参考需求**: 非功能性需求中的性能要求

## 9. 样式和 UI 优化

### 9.1 实现响应式设计
- [ ] 确保组件在移动端和桌面端都有良好的显示效果
  - 调整布局和间距
  - 优化触摸交互
  - **参考需求**: 非功能性需求 - 可用性要求中的响应式适配

### 9.2 实现键盘导航
- [ ] 添加适当的 tabIndex 和 ARIA 属性
  - 支持 Tab 键切换焦点
  - 支持 Enter 键确认操作
  - **参考需求**: 非功能性需求 - 可用性要求中的键盘导航

### 9.3 添加加载和过渡动画
- [ ] 实现平滑的添加/删除动画
  - 添加加载状态指示器
  - 优化视觉反馈
  - **参考需求**: 需求 3.2 - 清晰的视觉反馈

## 10. 测试实现

### 10.1 编写单元测试
- [ ] 为 addressValidation 工具编写测试用例
  - 测试有效和无效地址格式
  - 测试批量验证功能
  - 测试地址解析功能
  - **参考需求**: 地址验证规则的所有场景

### 10.2 编写集成测试
- [ ] 为 smartContracts API 路由编写测试
  - 测试正常的创建和更新流程
  - 测试各种错误场景
  - 测试权限验证
  - **参考需求**: API 层的所有功能点

### 10.3 编写组件测试
- [ ] 为所有前端组件编写测试
  - 测试用户交互
  - 测试状态管理
  - 测试错误处理
  - **参考需求**: 所有 UI 交互场景

### 10.4 编写 E2E 测试
- [ ] 使用 Playwright 编写端到端测试
  - 测试完整的用户流程
  - 测试错误场景
  - 测试数据持久化
  - **参考需求**: 主要用户故事的完整流程

## 实施优先级说明

- **P0（必须完成）**：数据库字段更新、后端 API、基础组件、地址验证
- **P1（应该完成）**：实时验证、适用性切换、项目表单集成
- **P2（可以延后）**：参考资料功能、高级验证、动画优化

## 预估工时

- 数据库更新和后端开发：2-3 天
- 前端组件开发：4-5 天
- 集成和测试：2-3 天
- 优化和完善：1-2 天

**总计：9-13 天**

## 依赖关系

1. 数据库字段更新必须首先完成
2. 后端 API 依赖数据库 schema 更新
3. 前端组件可以并行开发，但集成需要等待 API 完成
4. 测试需要在功能开发完成后进行
5. 数据迁移脚本需要在部署前准备好

## 风险和注意事项

1. **数据迁移风险**：
   - 需要仔细测试 TEXT 到 JSONB 的转换，确保现有数据不丢失
   - 迁移前必须备份现有数据
   - 需要处理空值、空字符串等边界情况
2. **JSONB 性能优化**：
   - 创建 GIN 索引以优化查询性能
   - 实时验证需要合理的防抖策略，避免频繁请求
3. **兼容性**：
   - 服务层需要处理旧格式数据（字符串）的读取
   - 确保新功能不影响现有的项目创建流程
4. **安全性**：所有输入需要进行 XSS 防护，地址验证需要在前后端都执行