# Repository Guidelines

## 项目结构与模块组织
- `app/`：Next.js App Router 路由与布局；`components/`：可复用 UI。
- `lib/`：核心逻辑（`trpc/`、`services/`、`db/`、`utils/`）；`config/`、`constants/`、`types/`：横切配置。
- `styles/`、`public/`：Tailwind 与静态资源；`scripts/`：运营脚本（`tsx` + `dotenv`）。
- `tests/`：`unit/` 与 `integration/`（见 `vitest.config*.ts`）。

## 构建、测试与本地开发
- `pnpm install`：安装依赖；`pnpm dev`：开发模式（Turbopack）。
- `pnpm build` / `pnpm start`：生产构建与启动。
- `pnpm lint` / `pnpm format`：ESLint 自动修复与 Prettier 格式化。
- `pnpm test` / `pnpm test:watch` / `pnpm test:coverage` / `pnpm test:coverage:open`：Vitest 及覆盖率报告。
- 数据库：`pnpm db:generate`、`pnpm db:migrate`、`pnpm db:studio`（Drizzle）。
- 组件：`pnpm storybook` / `pnpm build-storybook`。

## 代码风格与命名
- TypeScript 优先；Prettier：2 空格、分号、单引号；遵循 import order 规则。
- 组件 `PascalCase.tsx`；Hook `useXxx.ts`；工具 `camelCase.ts`；测试 `*.test.ts`。
- 代码中的“运行时文案/错误信息/注释/标识符”一律使用英文；对外沟通与文档使用中文（参考 CLAUDE.md）。

## 测试规范
- 框架：Vitest（Node 环境，超时 30s）。集成初始化：`tests/integration/setup.ts`（读取 `.env.local.test`）。
- 单元测试覆盖 `lib/utils/`、`lib/services/`；集成测试覆盖 TRPC 路由与业务流程。
- 覆盖率报告位于 `coverage/`，需确保关键路径保持可读与可维护性。

## 提交与 Pull Request
- 使用 Conventional Commits：`feat:`、`fix:`、`chore:`、`docs:` 等（与历史提交一致）。
- PR 聚焦单一主题，附变更说明、关联 Issue、UI 截图（如适用）。
- 合并前必须通过 `pnpm lint` 与 `pnpm test`；如变更数据库 Schema，请提交迁移文件并说明影响面。

## 安全与配置
- 勿提交密钥与私有数据：使用 `.env.local`、`.env.local.test`（已忽略）。
- 数据库与 ORM 对齐 `drizzle.config.ts`；运营脚本见 `scripts/` 目录；确保本地与 CI 环境变量一致。

## 用户沟通

- 与用户的所有对话必须**完全使用中文**
- 提交信息和用户文档必须使用中文