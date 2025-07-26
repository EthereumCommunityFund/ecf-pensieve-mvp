# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 语言和沟通要求

**重要：**项目的语言使用规则如下：

### 用户沟通

- 与用户的所有对话必须**完全使用中文**
- 提交信息和用户文档必须使用中文

### 代码文案

- **代码中的所有文案（错误信息、验证信息、API 响应消息等）必须使用英文**
- 代码注释必须使用英文
- 变量和函数的命名使用英文
- 这确保了代码的国际化兼容性和开发者友好性

## 开发命令

### 基础开发

```bash
# 安装依赖 (使用 pnpm 作为默认包管理器)
pnpm install

# 开发模式启动 (使用 turbopack)
pnpm run dev

# 构建项目
pnpm run build

# 生产环境启动
pnpm run start
```

### 代码质量和格式化

```bash
# 运行完整的代码检查和格式化
pnpm run format

# 仅运行 ESLint 检查和修复
pnpm run lint

# 仅运行 TypeScript 类型检查
pnpm run tsc

# 仅运行 Prettier 格式化
pnpm run prettier
```

### 数据库操作

```bash
# 生成 Drizzle 迁移文件
pnpm run db:generate

# 执行数据库迁移
pnpm run db:migrate

# 启动数据库管理界面
pnpm run db:studio
```

### Storybook

```bash
# 启动 Storybook 开发服务器
pnpm run storybook

# 构建 Storybook 静态文件
pnpm run build-storybook
```

## 项目架构

### 技术栈

- **前端**: Next.js 15 + React 19 + TypeScript
- **UI 框架**: Hero UI + Tailwind CSS v3
- **后端**: Next.js API Routes + tRPC
- **数据库**: PostgreSQL (Supabase) + Drizzle ORM
- **区块链集成**: Wagmi + RainbowKit + Ethers.js
- **状态管理**: TanStack Query (React Query)
- **组件开发**: Storybook

### 核心业务逻辑

这是一个区块链项目评估和治理平台，主要功能包括：

1. **项目管理 (Project)**: 用户创建和管理区块链项目
2. **提案系统 (Proposal/ItemProposal)**: 用户对项目内容提出修改建议
3. **投票机制 (Vote)**: 社区成员对提案进行投票
4. **权重系统 (Weight)**: 基于贡献的用户影响力计算
5. **项目日志 (ProjectLog)**: 追踪项目内容变更历史

### 目录结构说明

#### `/app` - Next.js App Router

- `api/` - API 路由和 CRON 作业
- `profile/[address]/` - 用户个人资料页面
- `project/` - 项目相关页面
- `projects/` - 项目列表页面

#### `/components` - 组件库

- `auth/` - 认证相关组件
- `base/` - 基础 UI 组件
- `biz/` - 业务逻辑组件
- `icons/` - 图标组件
- `layout/` - 布局组件
- `pages/` - 特定页面的组件
- `topbar/` - 顶部导航组件

#### `/lib` - 核心库

- `db/` - 数据库配置和 schema
- `trpc/` - tRPC 服务器和路由定义
- `supabase/` - Supabase 客户端配置
- `services/` - 业务服务层
- `utils/` - 工具函数

#### `/constants` - 配置常量

- `env.ts` - 环境变量配置
- `itemConfig.ts` - 项目条目配置
- `metrics.ts` - 指标定义

### tRPC 路由结构

主要的 API 路由位于 `lib/trpc/routers/`：

- `project.ts` - 项目 CRUD 操作
- `proposal.ts` - 提案管理
- `itemProposal.ts` - 条目提案管理
- `vote.ts` - 投票系统
- `auth.ts` - 用户认证
- `user.ts` - 用户管理

### 数据库 Schema

主要表结构位于 `lib/db/schema/`：

- `projects.ts` - 项目表
- `proposals.ts` - 提案表
- `itemProposals.ts` - 条目提案表
- `voteRecords.ts` - 投票记录表
- `profiles.ts` - 用户档案表
- `projectLogs.ts` - 项目日志表

## 开发规范

### 代码提交前检查

在提交代码前，**必须**运行以下命令确保代码质量：

```bash
pnpm run format
```

这会依次执行 prettier、lint 和 tsc 检查。

### 组件开发

- 新组件应放在适当的 `/components` 子目录中
- 使用 Storybook 开发和测试组件
- 遵循现有的 TypeScript 和样式约定
- 使用 Hero UI 组件库而不是创建自定义基础组件

### 样式开发

- 使用 Tailwind CSS 进行样式开发
- 响应式断点：mobile (1-809px), tablet (810-1199px), pc (1200-1399px), lg (1400px+)
- 使用项目定义的设计 tokens 和颜色方案

### 数据库更改

- 所有数据库更改必须通过 Drizzle 迁移
- 修改 schema 后运行 `pnpm run db:generate` 生成迁移
- 运行 `pnpm run db:migrate` 应用迁移

### 环境配置

项目需要以下环境变量（查看具体配置需求请参考现有的 `.env.example` 或代码中的环境变量使用）：

- `DATABASE_URL` - PostgreSQL 数据库连接字符串
- 其他 Supabase、AWS S3、区块链相关配置

## 项目特定概念

### 权重系统 (Weight System)

- 用户通过创建被采纳的提案获得权重
- 权重影响用户投票的影响力
- 关键常量在 `lib/constants.ts` 中定义

### 条目系统 (Item System)

- 项目由多个"条目"组成（如名称、标语、分类等）
- 条目分为"核心条目"(Essential) 和"非核心条目"
- 条目配置在 `constants/itemConfig.ts` 中定义

### 投票和共识机制

- 需要达到法定人数 (QUORUM_AMOUNT = 3) 才能通过
- 投票权重基于用户的 weight 值
- 详细业务逻辑请参考 `docs/prd/prd-be.md`

## Storybook 组件开发

- 组件的 stories 文件位于 `/stories` 目录
- 使用 `pnpm run storybook` 启动开发环境
- 新组件应该包含对应的 `.stories.tsx` 文件

## 后端接口测试

### 测试框架

项目使用 **Vitest** 作为测试框架，测试文件位于 `/tests/integration` 目录。

### 测试命令

```bash
# 运行所有集成测试
pnpm run test:integration

# 运行测试并监视文件变化
pnpm run test:integration:watch

# 生成测试覆盖率报告
pnpm run test:coverage

# 生成并打开覆盖率报告
pnpm run test:coverage:open
```

### 测试配置

- **环境配置**: 使用 `.env.local.test` 文件进行测试环境配置
- **测试超时**: 30秒（适应数据库操作的延迟）
- **测试模式**: 使用 `forks` 池模式，确保测试隔离
- **覆盖率目标**: 
  - `lib/trpc/routers/**/*.ts` - tRPC 路由
  - `lib/services/**/*.ts` - 业务服务层
  - `lib/utils/**/*.ts` - 工具函数

### 测试前置条件

1. **Supabase 本地实例**: 测试需要本地运行的 Supabase
   ```bash
   supabase start
   ```

2. **数据库迁移**: 测试前会自动运行数据库迁移

### 编写测试指南

#### 测试结构

```typescript
import { describe, it, expect, beforeAll, vi } from 'vitest';

// Mock Next.js cache functions
vi.mock('next/cache', () => ({
  revalidateTag: vi.fn(),
  unstable_cache: vi.fn((fn) => fn),
}));

describe('Feature Name', () => {
  beforeAll(async () => {
    // 设置测试数据
  });

  it('should handle specific case', async () => {
    // 测试逻辑
  });
});
```

#### 测试辅助工具

**Factory 函数** (位于 `/tests/integration/factories/`)
- `projectFactory.ts` - 创建测试项目数据
- `itemProposalFactory.ts` - 创建提案测试数据
- `invalidProjectFactory.ts` - 创建无效数据用于测试验证

**Helper 函数** (位于 `/tests/integration/helpers/`)
- `testHelpers.ts` - 通用测试辅助函数
- `pocItemsHelpers.ts` - POC_ITEMS 相关辅助函数
- `testConstants.ts` - 测试常量定义

#### 测试模式

1. **集成测试**: 测试完整的 API 流程，包括数据库操作
2. **Context 模拟**: 使用 `createContext` 函数模拟认证上下文
3. **用户模拟**: 使用 ethers.js 创建测试钱包地址
4. **数据清理**: 每个测试后清理测试数据，避免测试间干扰

#### 测试覆盖重点

- **认证流程**: 用户注册、登录、邀请码验证
- **项目操作**: 创建、更新、发布项目
- **提案系统**: 创建提案、投票、提案通过
- **权重计算**: 用户权重更新、投票权重计算
- **通知系统**: 通知创建和发送
- **数据验证**: 输入验证、业务规则验证

### 测试最佳实践

1. **隔离测试**: 每个测试应该独立，不依赖其他测试的执行顺序
2. **Mock 外部依赖**: 使用 vi.mock 模拟外部服务（如 Next.js cache）
3. **清晰的测试描述**: 使用描述性的测试名称，清楚说明测试内容
4. **边界测试**: 测试正常情况和异常情况，包括边界值
5. **性能考虑**: 避免在测试中执行过多数据库操作
