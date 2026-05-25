# DevWhisper

A personal knowledge operating system for technical learning retention. Markdown-first, graph-aware, revision-oriented, and designed to run on Vercel Hobby + Neon PostgreSQL with zero infrastructure overhead.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture Overview](#architecture-overview)
3. [Folder Structure](#folder-structure)
4. [Environment Variables](#environment-variables)
5. [Database Setup](#database-setup)
6. [Local Development](#local-development)
7. [Git Workflow](#git-workflow)
8. [Deployment](#deployment)
9. [Versioning](#versioning)
10. [Troubleshooting](#troubleshooting)

---

## Project Overview

DevWhisper turns raw technical learning into a structured, searchable, revisable second brain:

- **Knowledge base** (`/kb`) — markdown notes with `[[wiki-link]]` syntax and spaced-repetition scoring.
- **Revision engine** (`/revise`) — scheduled note reviews with confidence tracking.
- **Graph view** (`/graph`) — interactive React Flow visualisation of note/topic/blog connections.
- **Daily notes** (`/daily`) — structured daily learning logs.
- **Boards** (`/board`) — Excalidraw whiteboards linked to notes.
- **Blogs** (`/blogs`) — publishable posts derived from knowledge base notes.
- **Topics** (`/topics`) — top-level subject groupings with resources and flashcards.
- **Search** (`/search`) — PostgreSQL full-text search over note markdown.

---

## Architecture Overview

```
Next.js App Router (server components by default)
    │
    ├── src/app/              Pages — call repositories directly
    ├── src/features/         Domain modules
    │   └── <domain>/
    │       ├── repository.ts  DB queries (server-only)
    │       ├── actions.ts     "use server" mutations
    │       └── *.tsx          Feature components
    ├── src/lib/
    │   ├── db/               Drizzle client + schema
    │   ├── auth/             Better Auth config + session helpers
    │   ├── markdown/         Remark/rehype pipeline + wiki-link parser
    │   └── graph/            Graph data builder
    └── src/components/
        ├── ui/               shadcn-style primitive components
        └── layout/           App shell, nav, topbar, command palette
```

**Key architectural decisions:**

- Notes store markdown as the source of truth; TipTap `editorState` is optional JSONB.
- `[[wiki-link]]` syntax is parsed on every save and persisted as relational `noteLinks` rows.
- Notes carry spaced-repetition metadata: `confidenceScore`, `masteryScore`, `forgettingScore`.
- Heavy client dependencies (TipTap, Excalidraw, React Flow) are isolated in client-only feature files.
- All environment variables go through the Zod-validated `src/lib/env.ts` — never `process.env` directly.
- `src/lib/auth/session.ts` is guarded by `server-only` and must never be imported by client components.

---

## Folder Structure

```
devwhisper/
├── drizzle/                 SQL migrations
├── src/
│   ├── app/                 Next.js routes
│   ├── components/
│   │   ├── layout/          Shell, nav, topbar, command palette
│   │   ├── page/            Page-level layout helpers
│   │   └── ui/              Primitive components (button, card, …)
│   ├── features/
│   │   ├── blogs/
│   │   ├── board/
│   │   ├── daily/
│   │   ├── editor/          TipTap editor boundary
│   │   ├── graph/           React Flow graph boundary
│   │   ├── kb/
│   │   ├── revise/
│   │   └── topics/
│   ├── hooks/
│   └── lib/
│       ├── auth/
│       ├── db/
│       ├── graph/
│       ├── markdown/
│       └── utils/
├── .env.example
├── .gitattributes
├── .gitignore
├── CLAUDE.md
├── CONTRIBUTING.md
├── drizzle.config.ts
├── next.config.ts
├── package.json
├── pnpm-lock.yaml
└── tsconfig.json
```

---

## Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

| Variable               | Required | Description                                                         |
| ---------------------- | -------- | ------------------------------------------------------------------- |
| `DATABASE_URL`         | Yes      | Neon (or local) PostgreSQL connection string with `sslmode=require` |
| `BETTER_AUTH_SECRET`   | Yes      | At least 32 random bytes (use `openssl rand -base64 32`)            |
| `BETTER_AUTH_URL`      | Yes      | Base URL of the app (e.g. `http://localhost:3000`)                  |
| `GITHUB_CLIENT_ID`     | No       | GitHub OAuth app client ID                                          |
| `GITHUB_CLIENT_SECRET` | No       | GitHub OAuth app client secret                                      |
| `NEXT_PUBLIC_APP_URL`  | No       | Public app URL for client-side references                           |

**Never commit `.env`** — it is listed in `.gitignore` and also in `.gitattributes` to prevent accidental staging.

---

## Database Setup

### Neon (recommended for production)

1. Create a project at [neon.tech](https://neon.tech).
2. Copy the **pooled** connection string from the dashboard.
3. Set it as `DATABASE_URL` in `.env` (include `sslmode=require`).
4. Run the migration:

```bash
pnpm db:migrate
```

### Local PostgreSQL

```bash
# create a database
createdb devwhisper

# set the URL (no sslmode needed locally)
DATABASE_URL="postgresql://localhost/devwhisper"

pnpm db:migrate
```

### Schema changes

After editing `src/lib/db/schema.ts`:

```bash
pnpm db:generate   # generate a new SQL migration
pnpm db:migrate    # apply it
```

The `drizzle/meta/` directory is gitignored; only the SQL files are committed.

---

## Local Development

### Prerequisites

- Node.js ≥ 20.11.0
- pnpm 10.x (`npm i -g pnpm`)
- A PostgreSQL database (Neon or local)

### Setup

```bash
git clone <repo-url>
cd devwhisper
pnpm install
cp .env.example .env
# fill in .env values
pnpm db:migrate
pnpm dev
```

The app runs at `http://localhost:3000`.

### Common commands

```bash
pnpm dev           # start dev server with hot reload
pnpm build         # production build
pnpm typecheck     # TypeScript type check (no emit)
pnpm lint          # ESLint
pnpm format        # Prettier write
pnpm format:check  # Prettier check (used in CI)
pnpm test          # run all tests with Vitest
pnpm db:studio     # open Drizzle Studio (DB browser)
```

### Running a single test file

```bash
pnpm test src/lib/markdown/export.test.ts
```

### Full verification pass

```bash
pnpm typecheck && pnpm lint && pnpm test && pnpm build
```

---

## Git Workflow

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the full reference. Summary:

### Branch model

```
main        — always deployable, receives releases and hotfixes only
develop     — integration branch, all features merge here

feature/<name>   — new work
fix/<name>       — bug fixes
refactor/<scope> — restructuring
docs/<scope>     — documentation
hotfix/<name>    — urgent production fixes branched from main
```

### Daily feature workflow

```bash
# 1. Start from up-to-date develop
git switch develop && git pull --rebase origin develop

# 2. Create a branch
git switch -c feature/revision-scheduler

# 3. Commit with Conventional Commits
git add src/features/revise/
git commit -m "feat(revise): implement SM-2 scheduling algorithm"

# 4. Keep in sync with develop
git fetch origin && git rebase origin/develop

# 5. Push and open a PR targeting develop
git push -u origin feature/revision-scheduler
```

### Commit message format

```
type(scope): short description

feat(kb): add wiki-link parser
fix(auth): redirect anonymous users to sign-in
refactor(editor): extract markdown serialisation
docs(setup): add Neon connection string guide
```

### Releases

```bash
git switch main && git pull --rebase origin main
git tag -a v1.0.0 -m "release: v1.0.0"
git push origin main --tags
```

### Rollback

```bash
# Revert a specific commit (safe on shared branches)
git revert <commit-hash>

# Undo last local commit, keep changes
git reset --soft HEAD~1
```

---

## Deployment

### Vercel (recommended)

1. Import the repository into Vercel.
2. Framework preset: **Next.js** (auto-detected).
3. Add all environment variables from `.env.example`.
4. Build command: `pnpm run build`
5. Install command: `pnpm install`
6. Run `pnpm db:migrate` against the production database before first deploy.

Vercel Edge Network caches are invalidated by `revalidatePath()` calls in Server Actions.

### Environment separation

| Environment | Branch           | Database                            |
| ----------- | ---------------- | ----------------------------------- |
| Production  | `main`           | Neon production project             |
| Preview     | `develop` / PRs  | Neon branch or separate project     |
| Local       | feature branches | Local PostgreSQL or Neon dev branch |

---

## Versioning

DevWhisper follows [Semantic Versioning](https://semver.org/):

| Version                 | Meaning                                     |
| ----------------------- | ------------------------------------------- |
| `MAJOR` (e.g. `v2.0.0`) | Backwards-incompatible schema or API change |
| `MINOR` (e.g. `v1.1.0`) | New feature, backwards-compatible           |
| `PATCH` (e.g. `v1.0.1`) | Bug fix, backwards-compatible               |

Pre-release versions use `v0.x.y`. `v1.0.0` marks the first stable release.

### Changelog

Generate a draft changelog from Conventional Commits since the last tag:

```bash
git log v1.0.0..HEAD --pretty=format:"- %s (%h)" --no-merges
```

Organise output under `feat`, `fix`, `perf`, `chore` sections in `CHANGELOG.md`.

---

## Troubleshooting

### `DATABASE_URL` missing or invalid

The app builds without a database (env vars are optional in `src/lib/env.ts`), but any DB call at runtime will throw. Ensure `DATABASE_URL` is set and the database is migrated.

### `getDb()` throws "Cannot use require in ESM context"

Make sure `DATABASE_URL` is set. The Neon serverless driver initialises lazily — missing env causes a misleading error.

### TipTap / Excalidraw / React Flow rendering on the server

These are client-only. If you see a "window is not defined" error, ensure the importing component has `"use client"` and that it is not imported from a server component without `dynamic()`.

### Drizzle migration conflicts

If `pnpm db:generate` produces a migration that conflicts with existing ones, delete the broken migration file and re-run. Never edit applied migrations — write a new one instead.

### Husky hooks not running

```bash
pnpm prepare    # re-installs husky hooks
chmod +x .husky/pre-commit .husky/commit-msg
```
