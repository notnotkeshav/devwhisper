# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev              # start Next.js dev server
pnpm build            # production build
pnpm lint             # ESLint
pnpm typecheck        # tsc --noEmit
pnpm test             # vitest run (all tests)
pnpm test src/lib/markdown/export.test.ts  # run a single test file
pnpm db:generate      # generate Drizzle migration from schema changes
pnpm db:migrate       # apply migrations to the database
pnpm db:studio        # open Drizzle Studio
```

## Architecture

DevWhisper is a personal knowledge OS built on Next.js App Router. Every route is server-rendered; client components are isolated to interactive islands (editor, board, graph).

### Directory conventions

| Path                                  | Purpose                                                                            |
| ------------------------------------- | ---------------------------------------------------------------------------------- |
| `src/app/`                            | Next.js routes — pages call repositories directly, no intermediate service layer   |
| `src/features/<domain>/repository.ts` | DB query functions; always `import "server-only"` implicitly via `@/lib/db`        |
| `src/features/<domain>/actions.ts`    | `"use server"` Server Actions for mutations; validate with Zod then call `getDb()` |
| `src/features/<domain>/*.tsx`         | Feature-scoped React components                                                    |
| `src/lib/db/schema.ts`                | Single Drizzle schema file for all tables                                          |
| `src/lib/db/index.ts`                 | `getDb()` — singleton Neon+Drizzle client                                          |
| `src/lib/auth/auth.ts`                | Better Auth config (email/password + GitHub OAuth)                                 |
| `src/lib/auth/session.ts`             | `getSession()` / `requireUser()` — import only in server files                     |
| `src/lib/env.ts`                      | Zod-parsed `env` object — use this instead of `process.env` directly               |
| `src/components/ui/`                  | shadcn-style primitive components (local, not from a package)                      |
| `src/components/layout/`              | App shell, sidebar nav, topbar, command palette                                    |

### Data model highlights

- **Notes** are the core entity. Stored as markdown (source of truth); TipTap `editorState` is optional JSONB. Notes carry spaced-repetition metadata: `confidenceScore`, `masteryScore`, `forgettingScore`, `revisionCount`, `revisionIntervalDays`.
- Note status lifecycle: `seed → growing → evergreen → archived`.
- **`[[wiki-link]]`** syntax in note markdown is parsed by `src/lib/markdown/wiki-links.ts` and persisted as relational `noteLinks` rows on every save.
- **Graph** is built in `src/lib/graph/build.ts` from notes, blogs, topics, boards, and `graphEdges` rows. Rendered client-side with React Flow.
- **Boards** store Excalidraw scene JSON in `scene: jsonb`.
- **Blogs** can optionally reference a source note (`sourceNoteId`).
- **Daily notes** are keyed by `(userId, day)` unique index.

### Auth pattern

All authenticated pages call `requireUser()` from `@/lib/auth/session` at the top of the page component. This redirects to `/auth/sign-in` if no session exists. Never import session utilities in client components — the file is guarded by `server-only`.

### Mutation pattern

Server Actions live in `features/<domain>/actions.ts`. They:

1. Parse `FormData` with a Zod schema.
2. Call `getDb()` and run Drizzle queries.
3. Call `revalidatePath()` then `redirect()`.

### Key client-only boundaries

Heavy dependencies are dynamic-imported or client-component-only to avoid server bundle bloat:

- `@excalidraw/excalidraw` → `features/board/board-canvas.tsx`
- `reactflow` → `features/graph/graph-client.tsx`
- `@tiptap/react` → `features/editor/tiptap-editor.tsx`

### Search

Full-text search uses a PostgreSQL GIN index on `to_tsvector('english', markdown)` (defined in schema). Semantic/AI search is a future boundary at `src/lib/search`.

### Environment variables

Defined and validated in `src/lib/env.ts`. All vars are optional to allow builds without a database (e.g. CI). Required for a running app: `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`.

## Git Workflow

Full reference is in `CONTRIBUTING.md`. Key points for day-to-day work:

### Branch model

```
main        — always deployable; receives only release merges and hotfixes
develop     — integration branch; all feature PRs target this
feature/*   — new functionality
fix/*       — bug fixes
refactor/*  — restructuring with no behaviour change
docs/*      — documentation
hotfix/*    — urgent production fix branched from main
```

### Commit convention (Conventional Commits)

```
type(scope): short description

feat(kb): add wiki-link parser
fix(auth): redirect anonymous users to sign-in
refactor(editor): extract markdown serialisation into lib/markdown
docs(setup): add Neon connection guide
chore(deps): upgrade drizzle-orm to 0.46
```

Allowed types: `feat fix refactor docs chore test perf style build ci`
Allowed scopes: `kb revise board graph daily topics blogs auth db editor search settings layout deps ci`

Commitlint enforces this format on every commit via the `commit-msg` Husky hook.

### Pre-commit automation (Husky + lint-staged + commitlint)

On every `git commit`:

1. **lint-staged** runs ESLint + Prettier on staged `*.ts`/`*.tsx` files.
2. **commitlint** validates the commit message against Conventional Commits.

If a hook blocks your commit, fix the reported issue — do not use `--no-verify`.

To reinstall hooks after a fresh clone:

```bash
pnpm install   # runs pnpm prepare → husky automatically
```

### Feature workflow

```bash
git switch develop && git pull --rebase origin develop
git switch -c feature/my-feature
# … develop, commit atomically …
git fetch origin && git rebase origin/develop   # keep in sync
git push -u origin feature/my-feature           # open PR targeting develop
```

### Releases and tagging

```bash
git switch main && git merge --no-ff develop
git tag -a v1.0.0 -m "release: v1.0.0"
git push origin main --tags
```

Use Semantic Versioning: `MAJOR.MINOR.PATCH`. `v0.x.y` = pre-release.

### Rollback

```bash
git revert <hash>          # safe: adds a new revert commit (use on shared branches)
git reset --soft HEAD~1    # undo last local commit, keep changes staged
```

Never `reset --hard` on commits already pushed to `develop` or `main`.
