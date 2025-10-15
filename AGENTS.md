# Repository Guidelines

## Project Structure & Module Organization
- `app/` hosts the Next.js App Router, API routes under `app/api`, and feature areas like `project/` and `profile/[address]/`.
- `components/` provides reusable UI; prefer `components/biz` for domain widgets and `components/base` for primitives before adding new folders.
- Shared services live in `lib/` (`lib/trpc` for routers, `lib/db` for Drizzle schema, `lib/services` for business logic) while configuration is centralized under `constants/`, `config/`, and `context/`.
- `scripts/` includes operational tooling executed through `pnpm run <script>`; review inline comments before triggering data-changing jobs.
- `smart-contracts/` contains blockchain artifacts and deployment helpers; coordinate with the Web3 maintainers before editing.
- Tests live in `tests/` and alongside features as `*.test.ts(x)`; visual specs belong in `stories/`.

## Build, Test, and Development Commands
- `pnpm install` installs dependencies (pnpm is required).
- `pnpm dev` launches the app with Turbopack; `pnpm build` and `pnpm start` perform production builds and serve the compiled output.
- `pnpm format` runs Prettier, ESLint (with autofix), and TypeScript checks in sequence; run it before committing.
- Use `pnpm lint`, `pnpm tsc`, or `pnpm prettier` to target a single stage when iterating quickly.
- `pnpm storybook` opens the component sandbox; `pnpm build-storybook` produces static Storybook assets for review.
- `pnpm test`, `pnpm test:watch`, and `pnpm test:coverage` execute Vitest suites; prefer coverage mode before PR submission.

## Coding Style & Naming Conventions
- Rely on Prettier defaults (2-space indentation, trailing commas) and ESLint autofix; never hand-format large diffs.
- Name React components and files with `PascalCase`, hooks with `useCamelCase`, utilities with descriptive `camelCase` verbs.
- Keep Tailwind class lists grouped by layout → spacing → typography for readability; hoist shared styles into `styles/` when reused.
- All runtime copy and errors stay in English, per `CLAUDE.md`; UI text belongs in constants rather than inline literals.

## Testing Guidelines
- Write Vitest specs near the logic they cover or beneath `tests/<feature>`; follow the `subject.behavior.test.ts` pattern (e.g., `proposal.create.test.ts`).
- Mock Supabase, Ceramic, and chain integrations with existing helpers in `tests/mocks`; avoid hitting live services.
- For UI changes, pair unit tests with a Storybook story and capture a screenshot for regressions.
- Target meaningful coverage with `pnpm test:coverage`; investigate regressions before merging.

## Commit & Pull Request Guidelines
- Use imperative, concise commit subjects aligned with Conventional Commit prefixes (`feat:`, `fix:`, `chore:`); example: `feat: add vote weight badge`.
- Squash noisy WIP commits locally; keep history focused on reviewer-ready changes.
- PRs must describe scope, testing evidence (`pnpm test`, `pnpm format`), and any environment toggles; attach UI screenshots or Storybook URLs when visuals change.
- Link relevant Linear/Jira issues or Notion docs, and flag migrations, scripts, or contract updates for reviewer awareness.

## Environment & Security Tips
- Store secrets in `.env.local`; never commit credentials. Mirror required keys from teammates or the docs portal before running scripts.
- Run database edits through Drizzle migrations (`pnpm run db:generate` → `pnpm run db:migrate`) and review generated SQL in `drizzle/` before applying.
- Coordinate smart-contract deployments via the `scripts/migrate*` commands and document chain IDs, addresses, and verification steps in the PR.
- When adding third-party integrations, document required configuration under `docs/` and ensure fallbacks so the app degrades gracefully.
